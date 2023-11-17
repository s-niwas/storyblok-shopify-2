import { z } from "zod";
import { CartResult, ProductResult } from "./schemas";
// import { config } from "./config";
import {
  ProductsQuery,
  ProductByHandleQuery,
  CreateCartMutation,
  AddCartLinesMutation,
  GetCartQuery,
  RemoveCartLinesMutation,
  ProductRecommendationsQuery,
} from "./graphql";

// Make a request to Shopify's GraphQL API  and return the data object from the response body as JSON data.
const makeShopifyRequest = async (
  query: string,
  variables: Record<string, unknown> = {},
  buyerIP: string = "",
  shopifyShop: string = "",
  publicShopifyAccessToken: string = ""
) => {
  const isSSR = import.meta.env.SSR;
  const apiUrl = `https://${shopifyShop}/api/2023-01/graphql.json`;

  function getOptions() {
    // If the request is made from the server, we need to pass the private access token and the buyer IP
    isSSR &&
      !buyerIP &&
      console.error(
        `🔴 No buyer IP provided => make sure to pass the buyer IP when making a server side Shopify request.`
      );

    const options = {
      method: "POST",
      headers: {},
      body: JSON.stringify({ query, variables }),
    };
    // Check if the Shopify request is made from the server or the client
    if (isSSR) {
      options.headers = {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": publicShopifyAccessToken,
        // "Content-Type": "application/json",
        // "Shopify-Storefront-Private-Token": privateShopifyAccessToken,
        // "Shopify-Storefront-Buyer-IP": buyerIP,
      };
      return options;
    }
    options.headers = {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": publicShopifyAccessToken,
    };

    return options;
  }

  const response = await fetch(apiUrl, getOptions());

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${body}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: Error) => e.message).join("\n"));
  }

  return json.data;
};

// Get all products or a limited number of products (default: 10)
export const getProducts = async (options: {
  limit?:number;
  buyerIP: string;
  publicShopifyAccessToken: string;
  shopifyShop: string;
}) => {
  
  const {
    limit = 10,
    buyerIP,
    shopifyShop,
    publicShopifyAccessToken,
  } = options;

  const data = await makeShopifyRequest(
    ProductsQuery,
    { first: limit },
    buyerIP,
    shopifyShop,
    publicShopifyAccessToken
  );
  const { products } = data;

  if (!products) {
    throw new Error("No products found");
  }

  const productsList = products.edges.map((edge: any) => edge.node);
  const ProductsResult = z.array(ProductResult);
  const parsedProducts = ProductsResult.parse(productsList);

  return parsedProducts;
};


export const getProductByHandle = async (options: {
  handle: string;
  buyerIP: string;
  shopifyShop: string;
  publicShopifyAccessToken: string;
}) => {
  const { handle, buyerIP, shopifyShop, publicShopifyAccessToken } = options;

  const data = await makeShopifyRequest(
    ProductByHandleQuery,
    { handle },
    buyerIP,
    shopifyShop,
    publicShopifyAccessToken
  );
  const { product } = data;

  const parsedProduct = ProductResult.parse(product);

  return parsedProduct;
};

export const getProductRecommendations = async (options: {
  productId: string;
  buyerIP: string;
  shopifyShop: string;
  publicShopifyAccessToken: string;
}) => {
  const { productId, buyerIP, shopifyShop, publicShopifyAccessToken } = options;
  const data = await makeShopifyRequest(
    ProductRecommendationsQuery,
    {
      productId,
    },
    buyerIP,
    shopifyShop,
    publicShopifyAccessToken
  );
  const { productRecommendations } = data;

  const ProductsResult = z.array(ProductResult);
  const parsedProducts = ProductsResult.parse(productRecommendations);

  return parsedProducts;
};

// Create a cart and add a line item to it and return the cart object
export const createCart = async (
  id: string,
  quantity: number,
  shopifyShop: string,
  publicShopifyAccessToken: string
) => {
  const data = await makeShopifyRequest(
    CreateCartMutation,
    { id, quantity },
    shopifyShop,
    publicShopifyAccessToken
  );
  const { cartCreate } = data;
  const { cart } = cartCreate;
  const parsedCart = CartResult.parse(cart);

  return parsedCart;
};

// Add a line item to an existing cart (by ID) and return the updated cart object
export const addCartLines = async (
  id: string,
  merchandiseId: string,
  quantity: number,
  shopifyShop: string,
  publicShopifyAccessToken: string
) => {
  const data = await makeShopifyRequest(
    AddCartLinesMutation,
    {
      cartId: id,
      merchandiseId,
      quantity,
    },
    shopifyShop,
    publicShopifyAccessToken
  );
  const { cartLinesAdd } = data;
  const { cart } = cartLinesAdd;

  const parsedCart = CartResult.parse(cart);

  return parsedCart;
};

// Remove line items from an existing cart (by IDs) and return the updated cart object
export const removeCartLines = async (
  id: string,
  lineIds: string[],
  shopifyShop: string,
  publicShopifyAccessToken: string
) => {
  const data = await makeShopifyRequest(
    RemoveCartLinesMutation,
    {
      cartId: id,
      lineIds,
    },
    shopifyShop,
    publicShopifyAccessToken
  );
  const { cartLinesRemove } = data;
  const { cart } = cartLinesRemove;
  const parsedCart = CartResult.parse(cart);

  return parsedCart;
};

// Get a cart by its ID and return the cart object
export const getCart = async (
  id: string,
  shopifyShop: string,
  publicShopifyAccessToken: string
) => {
  const data = await makeShopifyRequest(
    GetCartQuery,
    { id },
    shopifyShop,
    publicShopifyAccessToken
  );

  const { cart } = data;
  const parsedCart = CartResult.parse(cart);

  return parsedCart;
};
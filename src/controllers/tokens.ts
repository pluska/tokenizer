import { APIGatewayProxyHandler } from "aws-lambda";
import { createToken as createTokenSchema, getCardDataSchema, tokenSchema } from "../validators/createToken.validation";
import {pool} from '../database/postgres'
import { generateToken } from "../lib/generateToken";
import { redisClient } from "../database/redis";
import * as dotenv from 'dotenv';

dotenv.config();

export const createToken:APIGatewayProxyHandler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { error, value } = createTokenSchema.query.validate(body);
    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: {
            message: "Validation error",
            details: error.details,
          },
        }),
      };
    }
    const { card_number, cvv, expiration_month, expiration_year, email } = value;

    const token = generateToken();
    const client = await pool.connect();
    await client.query(
      "INSERT INTO credit_cards (card_number, cvv, expiration_month, expiration_year, email, token) VALUES ($1, $2, $3, $4, $5, $6)",
      [card_number, cvv, expiration_month, expiration_year, email, token]
    );
    client.release();

    const data = {
      card_number,
      expiration_month,
      expiration_year,
      email
    };

    await redisClient.setex(token, 900, JSON.stringify(data));

    console.log(redisClient.get(token))

    return {
      statusCode: 200,
      body: JSON.stringify({token})
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: {
          message: "Internal server error",
        },
      }),
    };
  }

}


export const getCardData: APIGatewayProxyHandler = async (event) => {
  try {
    const { authorization } = event.headers;
    if (!authorization) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: {
            message: "Unauthorized: missing Authorization header",
          },
        }),
      };
    } else {
      const { error, value } = getCardDataSchema.validate({ authorization });
      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: {
              message: "Invalid parameters",
              details: error.details,
            },
          }),
        };
      }
      const pk = value.authorization.split(' ')[1];
      console.log(pk)
        const publicKey = process.env.PUBLIC_KEY;
        if (pk !== publicKey) {
          return {
            statusCode: 401,
            body: JSON.stringify({
              error: {
                message: "Unauthorized",
              },
            }),
          };
        }
    }
    const token = event.pathParameters?.token;
    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: {
            message: "Token missing",
          },
        }),
      };
    }
    const { error, value } = tokenSchema.validate(token);
    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: {
            message: "Token invalido",
          },
        }),
      };
    }
    const cardData = await new Promise<string>((resolve, reject) => {
      redisClient.get(value, (error: Error | null, result: string) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    console.log(cardData)
    if (!cardData) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: {
            message: "Card data not found",
          },
        }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(cardData),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: {
          message: "Internal server error",
        },
      }),
    };
  }
};
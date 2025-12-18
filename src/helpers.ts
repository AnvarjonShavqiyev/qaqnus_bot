import { User } from "telegraf/types";
import { CHUNK_SIZE, ZERO } from "./constants";

export const chunkArray = (array): User[][] => {
  const chunks: any[][] = [];

  for (let i = ZERO; i < array.length; i += CHUNK_SIZE) {
    chunks.push(array.slice(i, i + CHUNK_SIZE));
  }

  return chunks;
};

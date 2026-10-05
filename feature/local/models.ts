"use client";
import { MODEL_SCHEMA } from "../models";

type ModelMap = {
  [K in keyof typeof MODEL_SCHEMA]: {
    [P in keyof (typeof MODEL_SCHEMA)[K]]: (typeof MODEL_SCHEMA)[K][P];
  };
};

type EntityName = keyof ModelMap;

export type LocalChange_Create = {
  [K in EntityName]: {
    operation: "create";
    entity: K;
    payload: ModelMap[K];
  };
}[EntityName];

export type LocalChange_Update = {
  [K in EntityName]: {
    operation: "update";
    entity: K;
    identifier: string;
    payload: Partial<Omit<ModelMap[K], "id">>;
  };
}[EntityName];

export type LocalChange_Delete = {
  [K in EntityName]: {
    operation: "delete";
    entity: K;
    identifier: string;
  };
}[EntityName];

export type LocalChange =
  | LocalChange_Create
  | LocalChange_Delete
  | LocalChange_Update;

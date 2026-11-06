import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiError } from "../utils/apiError";

// createAsyncThunk where a failed request always rejects with { message, errors },
// so components can do `await dispatch(thunk()).unwrap()` and read err.message.
export const createApiThunk = (type, request) =>
  createAsyncThunk(type, async (arg, { rejectWithValue, signal }) => {
    try {
      return await request(arg, signal);
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  });

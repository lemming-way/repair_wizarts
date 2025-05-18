import { createSlice } from '@reduxjs/toolkit';

const categoriesSLice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
  },
  reducers: {
    setCategories(state, action) {
      state.categories = action.payload;
    },
  },
});

export const { setCategories } = categoriesSLice.actions;
export default categoriesSLice.reducer;

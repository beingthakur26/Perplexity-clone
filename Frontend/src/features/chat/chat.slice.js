import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        messages: [],
        loading: false,
    },
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload
        },
    }
})

export const { setMessages } = chatSlice.actions
export default chatSlice.reducer

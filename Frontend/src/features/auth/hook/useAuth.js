import { useDispatch } from "react-redux";
import { register, login, getMe } from "../services/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";


export function useAuth() {
    const dispatch = useDispatch()

    async function handleRegister({ fullName, email, username, password }) {
        try {
            dispatch(setError(null))
            dispatch(setLoading(true))
            const data = await register({ fullName, email, username, password })
            console.log("Registration successful:", data)
            return { success: true, message: data.message || "Registration successful! Please check your email for verification." }
        } catch (error) {
            const respData = error.response?.data;
            let errorMsg = respData?.message || error.message || "Registration failed";
            if (respData?.errors && respData.errors.length > 0) {
                errorMsg = Object.values(respData.errors[0])[0] || errorMsg;
            }
            dispatch(setError(errorMsg))
            return { success: false, message: errorMsg }
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setError(null))
            dispatch(setLoading(true))
            const data = await login({ email, password })
            dispatch(setUser(data.data)) // Backend returns { success: true, data: user }
            return { success: true, message: "Login successful!" }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Login failed";
            dispatch(setError(errorMsg))
            return { success: false, message: errorMsg }
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setError(null))
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.data))
        } catch (err) {
            console.log("getMe failed", err)
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
    }

}
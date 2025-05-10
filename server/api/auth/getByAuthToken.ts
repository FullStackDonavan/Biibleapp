
import { defineEventHandler, getCookie } from "h3";

export default defineEventHandler(async (event) => {
   
    const authToken = getCookie(event, 'auth_token')  
    
    return authToken
})
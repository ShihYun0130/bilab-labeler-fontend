import { useState, useEffect } from "react"
import lab_labeler_logo from "../assets/label_lab_logo.png"
import GoogleLogin from "react-google-login"
import "./GoogleLoginPage.css"
import { MRC_BASEURL } from "../config"
import axios from "axios"
import { useDispatch } from "react-redux"

function SocialLogin() {
    const [accessToken, setAccessToken] = useState("")
    const [profileObj, setProfileObj] = useState()
    const [userId, setUserId] = useState()

    // when state changes
    useEffect(async () => {
        if (accessToken && profileObj) {
            await login()
            dispatchLoginInfo()
        }
    })

    // change redux status and write to localStorage
    const dispatch = useDispatch()
    const dispatchLoginInfo = () => {
        console.log("dispatchLoginInfo", profileObj)
        dispatch({
            type: "LOGIN",
            payload: { accessToken, profileObj, userId },
        })
    }

    // when successful login
    const handleSuccessLogin = (response) => {
        console.log(response)
        if (response) {
            setAccessToken(response.accessToken)
            setProfileObj(response.profileObj)
        }
    }

    // when failed login
    const handleFailedLogin = (response) => {
        alert(response)
    }

    // post login info to server
    const login = async () => {
        const arg = {
            name: profileObj.name,
            accessToken: accessToken,
            email: profileObj.email,
            familyName: profileObj.familyName,
            givenName: profileObj.givenName,
            imageUrl: profileObj.imageUrl,
            userId: profileObj.googleId,
        }
        const res = await axios.post(`${MRC_BASEURL}/login`, arg)
        console.log("googleLogin: googleLogin api", res)
        setUserId(res.data._id)
        if (res.data.success) {
            dispatchLoginInfo()
        }
    }

    return (
        <div className="center-box">
            <div>
                <div className="center-container mt-20">
                    <img
                        className="logo-container"
                        src={lab_labeler_logo}
                        alt=""
                    />
                </div>
                <div className="title center-container mt-12">
                    {" "}
                    BI LAB Label System
                </div>
                <div className="center-container mt-30">
                    <GoogleLogin
                        clientId="993082770179-kk58asjsakh2l3qghsr7m9cstufro08s"
                        buttonText="使用 Google 登入"
                        onSuccess={handleSuccessLogin}
                        onFailure={handleFailedLogin}
                        cookiePolicy={"single_host_origin"}
                    />
                </div>
            </div>
        </div>
    )
}

export default SocialLogin

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from '@/store/store';

import {
    SignupRequest,
    SignupResponse,
    LoginResponse,
    LoginRequest,
    OtpResponse,
    OtpRequest,
    SaveAccountRequest,
    CheckReferralCodeResponse,
    CheckReferralCodeRequest
} from "@/types/auth.type";

import {
    SaveUserProfileRequest,
    UserProfileResponse,
    UserAccountIdResponse,
    ChangeUserPasswordRequest,
    UpdateUserReferralCountRequest,
    UpdateUserReferralCountResponse,
    UserByReferralCodeResponse,
    UserByReferralCodeRequest,
    UpdateBlockInfoRequest,
    UpdateBlockInfoResponse,
    CheckSignatureRequest,
    CheckSignatureResponse
} from "@/types/user.type";

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL + "/user/",
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.authToken;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        checkReferralCode: builder.mutation<CheckReferralCodeResponse, CheckReferralCodeRequest>({
            query: (data) => ({
                url: "check-referral-code",
                method: "POST",
                body: data,
            }),
        }),
        signup: builder.mutation<SignupResponse, SignupRequest>({
            query: (credentials) => ({
                url: "register",
                method: "POST",
                body: credentials,
            }),
        }),

        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: "login",
                method: "POST",
                body: credentials,
            }),
        }),

        otpVerify: builder.mutation<OtpResponse, OtpRequest>({
            query: (credentials) => ({
                url: "otp",
                method: "POST",
                body: credentials,
            }),
        }),
        otpResendEmail: builder.mutation<OtpResponse, any>({
            query: () => ({
                url: "otp/resend",
                method: "GET",
            }),
        }),

        saveAccountId: builder.mutation<any, SaveAccountRequest>({ 
            query: (data) => ({
                url: "account-id",
                method: "POST",
                body: data,
            }),
        }),

        getProfile: builder.mutation<UserProfileResponse, any>({
            query: () => ({
                url: "info",
                method: "GET",
            }),
        }),

        getUserById: builder.mutation<UserProfileResponse, any>({
            query: (userId: string) => ({
                url: `/info/${userId}`,
                method: "GET",
            }),
        }),

        getAccountIdByUserName: builder.mutation<UserAccountIdResponse, any>({
            query: (userName: string) => ({
                url: `/info/accountId/${userName}`,
                method: "GET",
            }),
        }),

        saveProfile: builder.mutation<UserProfileResponse, SaveUserProfileRequest>({
            query: (data) => ({
                url: "info",
                method: "PUT",
                body: data,
            }),
        }),

        uploadUserImage: builder.mutation<UserProfileResponse, any>({
            query: (data) => ({
                url: "info",
                method: "PUT",
                body: data,
            }),
        }),

        changePassword: builder.mutation<UserProfileResponse, ChangeUserPasswordRequest>({
            query: (data) => ({
                url: "password",
                method: "PUT",
                body: data,
            }),
        }),

        updateUserReferralCount: builder.mutation<UpdateUserReferralCountResponse, UpdateUserReferralCountRequest>({
            query: (data) => ({
                url: "info/referralCount",
                method: "PUT",
                body: data, 
            }),
        }),

        getUserByReferralCode: builder.query<UserByReferralCodeResponse, string>({
            query: (referralCode) => ({
                url: `invite/${referralCode}`,
                method: "GET",
            }),
        }),

        updateBlockInfo: builder.mutation<UpdateBlockInfoResponse, UpdateBlockInfoRequest>({
            query: (data) => ({
                url: "info/block-info",
                method: "PUT",
                body: data,
            }),
        }),

        checkSignature: builder.mutation<CheckSignatureResponse, CheckSignatureRequest>({
            query: (data) => ({
                url: "info/check-signature",
                method: "POST",
                body: data,
            }),
        }),
        increase200Points: builder.mutation<any, void>({
            query: () => ({
                url: "info/increase/200-points",
                method: "PATCH",
            }),
        }),

        increase10Points: builder.mutation<any, void>({
            query: () => ({
                url: "info/increase/10-points",
                method: "PATCH",
            }),
        }),
    }),
});

export const {
    useSignupMutation,
    useLoginMutation,
    useOtpVerifyMutation,
    useGetProfileMutation,
    useOtpResendEmailMutation,
    useSaveAccountIdMutation,
    useSaveProfileMutation,
    useUploadUserImageMutation,
    useChangePasswordMutation,
    useGetUserByIdMutation,
    useGetAccountIdByUserNameMutation,
    useCheckReferralCodeMutation,
    useUpdateUserReferralCountMutation,
    useGetUserByReferralCodeQuery,
    useUpdateBlockInfoMutation,
    useCheckSignatureMutation,
    useIncrease10PointsMutation,
    useIncrease200PointsMutation
} = userApi;

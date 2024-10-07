import { useTranslate } from "@/providers/translate.provider";
import * as Yup from 'yup';
import Image from "next/image";
import { useAppDispatch } from "@/hooks/app";
import { useFormik } from "formik";
import { MdOutlineAlternateEmail as EmailIcon } from "react-icons/md";
import { TbWorld as InetIcon } from "react-icons/tb";
import { useEffect, useState } from "react";
import { useSaveProfileMutation } from "@/api/userApi";
import { UserProfileType } from "@/types/user.type";
import { setUserProfile } from "@/reducers/user.slice";
import Button from "@/components/Common/Button";
import { FiCopy as CopyIcon } from 'react-icons/fi';
import xIcon from "@/public/icons/x-icon.png";
import InstaIcon from "@/public/icons/insta-orange.png";
import { toast } from "react-toastify";
import { IoIosInformationCircle } from "react-icons/io";

const NEXT_PUBLIC_ADITIONAL_REFERRAL_LINK = process.env.NEXT_PUBLIC_ADITIONAL_REFERRAL_LINK || "spheramarket.io/invite/";

type SocialLinksProps = {
    slug: string,
    name: string,
    onChange: (e: any) => void,
    onBlur: (e: any) => void,
    value: string,
}
const Social = ({ name, onChange, onBlur, value, slug }: SocialLinksProps) => {
    // Define URLs for each social platform
    const getSocialLink = (slug: any) => {
        switch (slug) {
            case 'x':
                return 'https://twitter.com';
            case 'instagram':
                return 'https://www.instagram.com';
            default:
                return '#';
        }
    };

    return (
        <div className="relative flex">
            {slug === 'x' &&
                <div className="flex items-center font-medium">
                    <Image alt="x" src={xIcon.src} width={26} height={26} />
                    <p className="text-orange font-dm font-14 px-5">X (Twitter)</p>
                </div>
            }
            {slug === 'instagram' &&
                <div className="flex items-center font-medium">
                    <Image alt="instagram" src={InstaIcon.src} width={30} height={30} />
                    <p className="text-orange font-dm font-14 pr-6 pl-4 rtl:pr-4 rtl:pl-6" >Instagram</p>
                </div>
            }

            <div className="relative">
                <div className="absolute inset-y-1/3 left-2">
                    <EmailIcon size={16} color="#FF7F2A" />
                </div>
                <input
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    type="text"
                    id={name}
                    name={name}
                    placeholder=""
                    style={{ border: "1px solid #FF7F2A" }}
                    className="pl-7 h-11 border w-48 bg-transparent placeholder-sp-gray-400 border-sp-gray-300 text-sm rounded-lg focus:ring-orange-hover focus:border-orange block"
                />
            </div>
        </div>
    );
};


const Links = ({ name, onChange, onBlur, value, slug }: SocialLinksProps) => {
    return (
        <div className="relative flex">
            <div className="absolute inset-y-1/3 left-2">
                <InetIcon size={16} color="#FF7F2A" />
            </div>
            <input
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                type="text"
                id={name}
                name={name}
                placeholder="https://www.mywebsite.com"
                style={{ border: "1px solid #FF7F2A" }}
                className="pl-7 h-11 border w-80 bg-transparent placeholder-sp-gray-400 border-sp-gray-300 text-sm rounded-lg focus:ring-orange-hover focus:border-orange block"
            />
        </div>
    )
}

type Props = {
    userProfile: UserProfileType
};

const DetailTab = ({ userProfile }: Props) => {
    const { _t } = useTranslate();
    const dispatch = useAppDispatch();

    const [saveProfile, { isSuccess, data, isLoading }] = useSaveProfileMutation();
    const [showTooltip, setShowTooltip] = useState(false); // Tooltip state
    const [showCopyTooltip, setShowCopyTooltip] = useState({ referralCode: false, fullUrl: false });

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required(_t("Required field")),
        lastName: Yup.string(),
        username: Yup.string().required(_t("Required field")),
        bio: Yup.string().max(150, _t("Maximum of 150 characters are allowed")),
        twitter: Yup.string(),
        link: Yup.string(),
        instagram: Yup.string(),
    });

    const formik = useFormik({
        initialValues: {
            firstName: userProfile.firstName || "",
            lastName: userProfile.lastName || "",
            username: userProfile.username || "",
            bio: userProfile.bio || "",
            links: userProfile.links.length ? userProfile.links : [
                {
                    name: 'x',
                    url: '',
                },
                {
                    name: 'instagram',
                    url: '',
                },
                {
                    name: 'links',
                    url: '',
                }
            ],
        },
        validationSchema,
        onSubmit: async (values) => {
            await saveProfile(values);
        },
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                toast.success("Copied to clipboard!"); // Optional: to show a toast message
            })
            .catch((error) => {
                toast.error("Failed to copy."); // Optional: to show an error message
                console.error("Failed to copy:", error);
            });
    };

    useEffect(() => {
        if (isSuccess && data) {
            dispatch(setUserProfile(data));
            toast.success(_t("Success"));
        }
    }, [isSuccess, data]);

    return (
        <div className="">
            <form onSubmit={formik.handleSubmit}>
                <div>
                    <div className="flex space-x-8">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block mb-2 text-14 font-dm font-medium text-orange"
                            >
                                {_t("First name")}
                            </label>
                            <input
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.firstName}
                                autoComplete="on"
                                type="text"
                                id="firstName"
                                name="firstName"
                                placeholder="First name"
                                className="border-orange h-11 w-80 bg-transparent placeholder-sp-gray-400 text-sm rounded-lg focus:ring-orange-hover focus:border-orange block"
                                style={{ border: "1px solid #FF7F2A" }}
                            />
                            {formik.errors.firstName && formik.touched.firstName ? <div className="text-red-500">{formik.errors.firstName}</div> : null}
                        </div>
                        <div>
                            <label
                                htmlFor="lastName"
                                className="block mb-2 text-14 font-dm font-medium text-orange"
                            >
                                {_t("Last name")}
                            </label>
                            <input
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.lastName}
                                autoComplete="on"
                                type="text"
                                id="lastName"
                                name="lastName"
                                placeholder="Last name"
                                className="border h-11 w-80 bg-transparent placeholder-sp-gray-400 border-sp-gray-300 text-sm rounded-lg focus:ring-orange-hover focus:border-orange block"
                                style={{ border: "1px solid #FF7F2A" }}
                            />
                        </div>
                    </div>
                    <div className="mt-10">
                        <label
                            htmlFor="username"
                            className="block mb-2 text-14 font-dm font-medium text-orange"
                        >
                            {_t("UserName")}
                        </label>
                        <div className="relative">
                            <div className="relative">
                                <div className="absolute inset-y-1/3 left-2">
                                    <EmailIcon size={16} color="#FF7F2A" />
                                </div>
                                <input
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.username}
                                    autoComplete="on"
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="UserName"
                                    className="pl-7 h-11 border w-4/12 bg-transparent placeholder-sp-gray-400 border-sp-gray-300 text-sm rounded-lg focus:ring-orange-hover focus:border-orange block"
                                    style={{ border: "1px solid #FF7F2A" }}

                                />
                            </div>
                            <div
                                className={`text-red-500 h-[24px] ${formik.errors.username && formik.touched.username ? "visible" : "invisible"}`}
                            >
                                {formik.errors.username}
                            </div>
                        </div>
                    </div>
                    <div className="mt-5">
                        <label
                            htmlFor="bio"
                            className="block mb-2 text-14 font-dm font-medium text-orange"
                        >
                            <p>{_t("Bio")} <span className="text-12 text-sp-gray-500">{_t("(Max 150 Char.)")}</span></p>
                        </label>
                        <textarea
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.bio}
                            rows={3}
                            id="bio"
                            name="bio"
                            placeholder="Bio"
                            className="border w-4/12 bg-transparent placeholder-sp-gray-400 border-sp-gray-300 text-sm rounded-lg focus:ring-orange-hover focus:border-orange block"
                            style={{ border: "1px solid #FF7F2A" }}

                        />
                        <div className="text-sp-gray-500 text-12 mt-1">
                            {`${formik.values.bio.length}/150`}
                        </div>
                        {formik.errors.bio && formik.touched.bio && (
                            <div className="text-red-500">{formik.errors.bio}</div>
                        )}
                    </div>
                    <div className="mt-5 flex space-x-10">
                        <div>
                            <p className="text-14 text-orange font-dm font-medium mb-2">{_t("Social Connections")}</p>
                            <div className="space-y-7">
                                {formik.values.links.map((value, index) => (
                                    value.name != 'links' &&
                                    <Social
                                        slug={value.name}
                                        value={formik.values.links[index].url}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        name={`links[${index}].url`}
                                        key={index}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-14 text-orange font-dm font-medium mb-2">{_t("Links")}</p>
                            <div className="space-y-7">
                                {formik.values.links.map((value, index) => (
                                    value.name === 'links' &&
                                    <Links
                                        slug={value.name}
                                        value={formik.values.links[index].url}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        name={`links[${index}].url`}
                                        key={index}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 relative flex items-center gap-2">
                        <p
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            className="text-14 text-orange font-dm font-medium cursor-pointer flex justify-center items-center gap-2"
                        >
                            <IoIosInformationCircle size={20} color='#FF7F2A' className='cursor-pointer mt-[-3px]' />
                            {_t("Referral Code")}
                            {showTooltip && (
                                <div className="absolute bottom-full left-0  w-[250px] md:w-[380px] bg-gray-800/60 backdrop-blur-sm text-white text-sm p-4 rounded-2xl border-2 border-[#FF7F2A]">
                                    <p className='text-[14px] md:text-[16px]'>
                                        You can use that Referral Code for the following websites:
                                        <ul className="list-disc ml-5 mt-4">
                                            <li>
                                                <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" className="text-orange hover:underline">
                                                    spheraworld-giveaway
                                                </a>
                                            </li>
                                            <li>
                                                <a href="https://spheraworld-summer-season.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-orange hover:underline">
                                                    spheraworld-summer-season
                                                </a>
                                            </li>
                                        </ul>
                                    </p>

                                </div>
                            )}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                        {/* <div className="relative">
                            <span className="text-[16px] text-[#fff]">
                                {userProfile?.referralCode}
                            </span>
                            
                        </div> */}

                        <div className="relative flex justify-center items-center gap-5">
                            <span className="text-[16px] text-[#fff]">
                                {NEXT_PUBLIC_ADITIONAL_REFERRAL_LINK}{userProfile?.referralCode}
                            </span>
                            <div>
                                <CopyIcon
                                    className="ml-2 cursor-pointer text-orange"
                                    size={20}
                                    onClick={() => copyToClipboard(`${NEXT_PUBLIC_ADITIONAL_REFERRAL_LINK}${userProfile?.referralCode}`)}
                                    onMouseEnter={() => setShowCopyTooltip(prev => ({ ...prev, fullUrl: true }))}
                                    onMouseLeave={() => setShowCopyTooltip(prev => ({ ...prev, fullUrl: false }))}
                                />
                                {showCopyTooltip.fullUrl && (
                                    <div className="absolute bottom-full left-30 mb-2 w-[180px] bg-gray-800/60 backdrop-blur-sm text-white text-sm p-2 rounded-lg border-2 border-[#FF7F2A]">
                                        Copy Full URL
                                    </div>
                                )}
                            </div>
                            <div>
                                <CopyIcon
                                    className="ml-2 cursor-pointer text-orange"
                                    size={20}
                                    onClick={() => copyToClipboard(userProfile?.referralCode!)}
                                    onMouseEnter={() => setShowCopyTooltip(prev => ({ ...prev, referralCode: true }))}
                                    onMouseLeave={() => setShowCopyTooltip(prev => ({ ...prev, referralCode: false }))}
                                />
                                {showCopyTooltip.referralCode && (
                                    <div className="absolute bottom-full left-50 mb-2 w-[150px] bg-gray-800/60 backdrop-blur-sm text-white text-sm p-2 rounded-lg border-2 border-[#FF7F2A]">
                                        Copy Referral Code
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 space-x-2 flex">
                        <Button
                            type="submit"
                            disabled={formik.isSubmitting || isLoading}
                            isLoading={formik.isSubmitting || isLoading}
                            className="text-white rounded-lg h-10 font-dm text-14 w-20"
                            label={_t("Save")}
                        />
                    </div>
                </div>
            </form>
        </div>
    )
}

export default DetailTab;

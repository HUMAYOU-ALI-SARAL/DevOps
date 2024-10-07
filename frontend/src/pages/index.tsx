'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/app";
import { selectAuthToken } from "@/reducers/user.slice";
import AuthLayout from "./layouts/auth.layout";
import Cookies from 'js-cookie';

const AuthPopup = ({ onClose }: { onClose: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === '@dm!n12E') {
      Cookies.set('test_auth_user', 'true');
      onClose();
      window.location.reload(); // Reload the page to re-check the cookie and redirect accordingly
    } else {
      setError('Incorrect username or password');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1C1C1C] p-6 rounded shadow-lg w-[400px]">
        <h2 className="text-2xl mb-4 text-white font-bold w-full text-center">Portal Access Login</h2>
        <div>
          <label className="block mb-2 text-white">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded w-full text-black"
          />
        </div>
        <div className="mt-4">
          <label className="block mb-2 text-white">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full text-black"
          />
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button onClick={handleLogin} className="w-full mt-4 bg-orange text-white py-2 px-4 rounded">
          Login
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const authToken: any = useAppSelector(selectAuthToken);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const authUser = Cookies.get('test_auth_user');

    if (!authUser) {
      setShowPopup(true);
    } else {
      if (!authToken) {
        router.push('/auth/login');
      } else {
        router.push('/profile');
      }

    }
  }, [authToken, router]);

  return (
    <AuthLayout title="HomePage">
      {showPopup && <AuthPopup onClose={() => setShowPopup(false)} />}
      <div className="w-full flex items-center justify-center" style={{ height: "100dvh" }}>
        <div className="text-orange text-7xl"></div>
      </div>
    </AuthLayout>
  );
}



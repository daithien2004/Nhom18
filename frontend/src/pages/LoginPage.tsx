import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FormLoginSchema, type formLogin } from "../schemas/FormLoginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginApi } from "../services/authService";
import axios from "axios";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<formLogin>({
    resolver: zodResolver(FormLoginSchema),
    defaultValues: { email: "tuanthanh07082004@gmail.com", password: "123456" },
    mode: "onChange",
  });

  const onSubmit = async (data: formLogin) => {
    try {
      const res = await loginApi(data.email, data.password);
      localStorage.setItem("access_token", res.access_token);
      alert("Đăng nhập thành công!");
      return res.user;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert("Email hoặc mật khẩu không đúng.");
        } else {
          alert("Có lỗi xảy ra, vui lòng thử lại.");
        }
      } else {
        alert(`Lỗi không xác định xảy ra: ${error}`);
      }
      return null;
    }
  };

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 shadow-sm p-10 rounded-2xl gap-5 text-sm">
        <div className="flex justify-center">
          <img src="./img/logo.png"></img>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between gap-2"
        >
          <h1 className="font-bold text-2xl">
            Welcome back! Please Sign in to continue
          </h1>
          <label>Email </label>
          <input
            placeholder="Email"
            {...register("email")}
            className="rounded-md mb-3 shadow-sm p-3 px-4 outline-0"
          ></input>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          <label>Password</label>
          <input
            placeholder="Password"
            {...register("password")}
            className="border-0 p-3 px-4 rounded-md mb-3 shadow-sm outline-0"
          ></input>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <div className="flex flex-row justify-between mb-3">
            <div>
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="mr-1 cursor-pointer"
              />
              <label>Remember me</label>
            </div>
            <Link
              to="/forgotpass"
              className="text-blue-700 hover:text-red-500 underline"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="cursor-pointer bg-blue-500 rounded-2xl text-white py-2 hover:bg-blue-800"
            disabled={!isDirty && !isValid}
          >
            Sign In
          </button>
          <label>
            Don't have an account? Register{" "}
            <Link to="/register" className="text-blue-700 hover:text-red-500">
              here
            </Link>
          </label>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;

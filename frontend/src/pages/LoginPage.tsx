import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FormLoginSchema, type FormLogin } from '../schemas/FormLoginSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginThunk } from '../store/thunks/authThunks';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth); // lấy state từ redux
  const loginLoading = loading.login;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormLogin>({
    resolver: zodResolver(FormLoginSchema),
    defaultValues: { email: 'alice@example.com', password: '123456' },
    mode: 'onChange',
  });

  const onSubmit = async (data: FormLogin) => {
    const resultAction = await dispatch(loginThunk(data));

    if (loginThunk.fulfilled.match(resultAction)) {
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } else {
      const payload = resultAction.payload;

      if (payload && typeof payload === 'object') {
        if ('message' in payload && typeof payload.message === 'string') {
          // Lỗi chung từ backend
          toast.error(payload.message); // ✅ đã là string
        }
      } else {
        // fallback
        toast.error('Đăng nhập thất bại!');
      }
    }
  };

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 shadow-sm p-10 rounded-2xl gap-5 text-sm">
        <div className="flex justify-center">
          <img src="./img/logo.png" />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between gap-2"
        >
          <h1 className="font-bold text-2xl">
            Welcome back! Please Sign in to continue
          </h1>

          {/* Email */}
          <label>Email </label>
          <input
            placeholder="Email"
            {...register('email')}
            className="rounded-md mb-3 shadow-sm p-3 px-4 outline-0"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          {/* Password */}
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            {...register('password')}
            className="border-0 p-3 px-4 rounded-md mb-3 shadow-sm outline-0"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          {/* Remember + Links */}
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
              to="/forgot-password"
              className="text-blue-700 hover:text-red-500 underline"
            >
              Forgot Password?
            </Link>
            <Link
              to="/register"
              className="text-blue-700 hover:text-red-500 underline"
            >
              Register
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="cursor-pointer bg-blue-500 rounded-2xl text-white py-2 hover:bg-blue-800 disabled:opacity-50"
            disabled={loginLoading || !isValid}
          >
            {loginLoading ? (
              <>
                <ClipLoader size={20} color="#fff" className="mr-2" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <label>
            Don't have an account? Register{' '}
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

import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FormLoginSchema, type FormLogin } from '../schemas/FormLoginSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginThunk } from '../store/thunks/authThunks';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const loginLoading = loading.login;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormLogin>({
    resolver: zodResolver(FormLoginSchema),
    defaultValues: { email: 'john.doe@example.com', password: 'User@123' },
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
          toast.error(payload.message);
        }
      } else {
        toast.error('Đăng nhập thất bại!');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="hidden md:flex justify-center items-center">
          <img
            src="./img/logo.png"
            alt="Logo"
            className="max-w-full max-h-40 object-contain"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <h1 className="text-xl font-bold text-gray-800">
            Welcome back! Please Sign in to continue
          </h1>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              placeholder="Enter your email"
              {...register('email')}
              className="w-full p-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              className="w-full p-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember + Links */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600 cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="text-gray-600 cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 transition-all duration-300"
              >
                Forgot Password?
              </Link>
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 transition-all duration-300"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loginLoading || !isValid}
          >
            {loginLoading && <Loader2 className="animate-spin w-4 h-4" />}
            {loginLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="text-sm text-gray-500 text-center">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 transition-all duration-300"
            >
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

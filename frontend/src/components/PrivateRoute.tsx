import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface PrivateRouteProps {
  isAuthenticated: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated }) => {
  // 1. Kiểm tra trạng thái đăng nhập
  if (!isAuthenticated) {
    // 2. Nếu CHƯA đăng nhập, chuyển hướng đến trang '/login'
    return <Navigate to="/login" replace />;
  }

  // 3. Nếu ĐÃ đăng nhập, cho phép render component con (tuyến đường đích)
  // `Outlet` sẽ render phần tử được lồng bên trong PrivateRoute trong `Routes`.
  return <Outlet />;
};

export default PrivateRoute;

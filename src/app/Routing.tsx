import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './Layout';

import { menuRoutes } from '../shared/constants/routes';

const Routing = () => {
  return (
    <Routes>
      {menuRoutes.map(({ link, Component }) => (
        <Route
          key={link}
          path={link}
          element={
            <Layout>
              <Component />
            </Layout>
          }
        ></Route>
      ))}
      <Route path="/" element={<Navigate to={menuRoutes[0].link} replace />} />
      <Route path="*" element={<></>} />
    </Routes>
  );
};

export default Routing;

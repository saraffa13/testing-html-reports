// import type React from "react";
// import TopAppBar from "./components/Navigation/Appbar";
// import SideNav from "./components/Navigation/SideNav";

// interface PageLayoutProps {
//   children: React.ReactNode;
// }

// const Layout: React.FC<PageLayoutProps> = ({ children }) => {
//   return (
//     <div className="flex min-h-screen w-full relative bg-[#C2DBFA] max-w-[100vw]">
//       <div
//         className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1162px] h-screen bg-[url('/star.svg')] bg-no-repeat bg-contain pointer-events-none overflow-hidden"
//         style={{
//           filter: "blur(2px)",
//           zIndex: 1,
//           opacity: 1,
//         }}
//       />
//       <TopAppBar />
//       <div className="mt-[5rem] mx-[0.5rem] w-full h-full z-10 backdrop-blur-lg flex">
//         <SideNav>
//           <div className="bg-white w-full h-full rounded-2xl p-4">{children}</div>
//         </SideNav>
//       </div>
//     </div>
//   );
// };

// export default Layout;

import type React from "react";
import { Outlet } from "react-router-dom";
import TopAppBar from "./components/Navigation/Appbar";
import SideNav from "./components/Navigation/SideNav";

const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full relative bg-[#C2DBFA] max-w-[100vw]">
      <div
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1162px] h-screen bg-[url('/star.svg')] bg-no-repeat bg-contain pointer-events-none overflow-hidden"
        style={{
          filter: "blur(2px)",
          zIndex: 1,
          opacity: 1,
        }}
      />
      <TopAppBar />
      <div className="mt-[5rem] mx-[0.5rem] w-full h-full z-10 backdrop-blur-lg flex">
        <SideNav>
          <div className="bg-white w-full h-full rounded-2xl p-4">
            <Outlet />
          </div>
        </SideNav>
      </div>
    </div>
  );
};

export default Layout;

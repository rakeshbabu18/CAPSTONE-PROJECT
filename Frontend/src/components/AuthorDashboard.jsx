import { NavLink, Outlet } from "react-router";
import {
  pageWrapper,
  navLinkClass,
  navLinkActiveClass,
  divider,
} from "../styles/common";

function AuthorDashboard() {
  return (
    <div className={pageWrapper}>
      
      {/* Author Navigation */}
      <div className="flex gap-6 mb-6 justify-between items-center">
        <div className="flex gap-6">
          <NavLink
            to="articles"
            className={({ isActive }) =>
              isActive ? navLinkActiveClass : navLinkClass
            }
          >
            Articles
          </NavLink>

          <NavLink
            to="write-article"
            className={({ isActive }) =>
              isActive ? navLinkActiveClass : navLinkClass
            }
          >
            Write Article
          </NavLink>
        </div>

      </div>

      <div className={divider}></div>

      {/* Nested route content */}
      <Outlet />

    </div>
  );
}

export default AuthorDashboard;
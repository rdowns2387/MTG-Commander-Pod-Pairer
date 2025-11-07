import "../App.scss";
import Logo from "../img/logo192.png";

export const Footer = () => {
  return (
    <div className="footer">
      <div class="footer-content">
        <div>
          <img className="footer-logo" src={Logo} />
        </div>
      </div>
    </div>
  );
};

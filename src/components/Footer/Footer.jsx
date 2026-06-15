import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p className="footer-copyright">&copy; 2026 Flixster. All rights reserved.</p>
      <p className="footer-attribution">
        Powered by{" "}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
          The Movie Database (TMDb)
        </a>
      </p>
    </footer>
  );
};

export default Footer;

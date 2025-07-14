import { motion } from "framer-motion";

const transition = { duration: 1, yoyo: Infinity, ease: "easeInOut" };

const propsShared = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition,
};

const BbvaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <motion.path
      {...propsShared}
      d="M45.5625 6.1875H8.4375C7.2 6.1875 6.1875 7.2 6.1875 8.4375V45.5625C6.1875 46.8 7.2 47.8125 8.4375 47.8125H45.5625C46.8 47.8125 47.8125 46.8 47.8125 45.5625V8.4375C47.8125 7.2 46.8 6.1875 45.5625 6.1875Z"
      stroke="#E9E7DB"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.path
      {...propsShared}
      d="M35.0898 22.2739L31.3233 31.2739L27.5568 22.2739"
      stroke="#E9E7DB"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.path
      {...propsShared}
      d="M35.4749 29.4766L39.2414 20.4766L43.0079 29.4766"
      stroke="#E9E7DB"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.path
      {...propsShared}
      d="M23.2683 26.7739C24.511 26.7739 25.5183 27.7813 25.5183 29.0239C25.5183 30.2666 24.511 31.2739 23.2683 31.2739H19.5558V22.2739H23.2683C24.511 22.2739 25.5183 23.2813 25.5183 24.5239C25.5183 25.7666 24.511 26.7739 23.2683 26.7739Z"
      stroke="#E9E7DB"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.path
      {...propsShared}
      d="M23.2683 26.7739H19.5558"
      stroke="#E9E7DB"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.path
      {...propsShared}
      d="M14.7047 26.7739C15.9474 26.7739 16.9547 27.7813 16.9547 29.0239C16.9547 30.2666 15.9474 31.2739 14.7047 31.2739H10.9922V22.2739H14.7047C15.9474 22.2739 16.9547 23.2813 16.9547 24.5239C16.9547 25.7666 15.9474 26.7739 14.7047 26.7739Z"
      stroke="#E9E7DB"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.path
      {...propsShared}
      d="M14.7047 26.7739H10.9922"
      stroke="#E9E7DB"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default BbvaIcon;

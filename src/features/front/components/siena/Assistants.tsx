import assistanceSchema from "@/validation/yupSchema";
import { Formik, FormikProps } from "formik";
import { FC, useCallback, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Separator from "@/icons/separator";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import AnimatedEntrance from "../AnimatedEntrance";
import { Guest, GuestFormData, Invitation } from "@/types";
import { QrCode, Plus, Minus, XCircle, ArrowRight } from "lucide-react";
import { GuestService } from "@/services/guestService";
import { useInvitationStore } from "../../stores/invitationStore";
import { GuestQuotesService } from "@/services/guestQuotesService";
import { ActivityService } from "@/services/activityService";
import { cn } from "@heroui/theme";

const defaultGuest: Guest = {
  asistencia: null,
  confirmados: 1,
  id: "_",
  notaInvitado: "",
  nombre: "Invitado genérico",
  invitados: 1,
  cambiosPermitidos: true,
  fechaCreacion: null,
  notaAnfitrion: "",
  tieneTelefono: false,
  ultimaModificacion: null,
};

const isDefaultId = (id?: string) => id === "_";

type Props = {
  containerClassName?: string;
  textClassName?: string;
  svgsColor?: string;
  btnClassName?: string;
  activeConfirmBtnClassName?: string;
  activeDeclineBtnClassName?: string;
  inactiveConfirmBtnClassName?: string;
  inactiveDeclineBtnClassName?: string;
  sendFormBtnClassName?: string;
  sealImage?: string;
};

interface StateCardProps {
  guestData: Guest;
  invitationData?: Invitation | null;
  textClassName?: string;
  svgsColor?: string;
}

// ============================================================================
// SVGS ORNAMENTALES
// ============================================================================

const FlowersCoverUp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 324 118"
    fill="none"
    {...props}
  >
    <g>
      <path
        d="M220.502 107.479C221.511 102.595 214.421 102.343 209.978 103.225C205.85 103.73 202.731 105.4 200.305 107.479H190.474C189.213 100.988 194.16 97.4907 200.777 99.0032C207.647 100.358 213.255 92.8588 219.431 90.5901C226.363 86.3678 211.9 87.3131 209.411 85.6116C200.273 81.6414 192.364 87.1555 191.451 97.0181C191.199 98.436 190.631 100.484 189.434 100.988C187.197 93.615 185.275 85.7061 181.683 78.7425C178.311 68.1868 197.437 72.7872 197.406 53.6608C197.816 51.1086 198.572 38.0636 194.444 44.46C187.858 53.4403 180.926 63.2713 180.17 74.7093C160.414 55.0158 180.548 42.727 165.959 23.4746C161.516 16.9522 163.439 32.4549 161.611 33.7468C158.996 43.4832 166.432 51.7073 169.457 59.9943C162.714 55.3309 162.084 44.7121 153.482 42.4119C148.251 41.2146 143.367 37.0553 138.672 36.0785C140.5 41.9078 145.636 47.2014 150.646 51.1716C160.445 56.8433 165.676 55.772 172.513 67.0209C177.145 74.8038 163.502 55.8035 150.614 61.0656C148.535 62.0739 142.611 61.5067 141.413 63.9645C152.032 76.3162 172.482 58.6394 180.265 80.4125C181.588 83.721 175.916 77.4191 175.097 77.3246C172.545 73.4489 149.039 74.1106 150.929 79.4357C169.457 92.6697 182.376 65.603 187.228 103.225C182.785 99.9484 181.494 92.8588 173.805 92.1656C166.999 90.212 160.13 86.2418 153.198 86.9665C157.798 94.4343 165.928 103.478 176.452 102.375C179.099 102.501 182.565 101.177 184.645 103.446C185.842 104.643 186.693 106.03 187.323 107.479H148.976C149.511 101.524 153.765 96.7345 153.671 90.8737C150.677 82.8702 136.309 96.7345 136.214 107.479H129.156C127.581 105.494 126.446 103.824 126.415 103.194C124.587 97.8058 127.675 95.7892 133 93.9931C139.586 91.9135 141.382 83.1538 146.549 78.837C147.085 78.2383 148.219 77.6712 147.621 76.6944C146.77 75.0244 139.019 79.6248 136.246 78.9C126.131 78.0178 119.546 86.7774 123.453 95.9152C123.831 97.5222 124.556 99.8224 123.736 100.862C90.1157 56.5912 113.716 82.177 124.052 52.3374C124.745 49.9427 129.566 39.8281 123.705 44.1134C114.126 50.2893 104.894 59.5847 105.461 72.3145C85.2948 46.4136 107.383 39.324 110.313 14.8095C111.164 10.3036 108.769 12.3203 105.65 15.0616C91.4706 24.1048 93.1722 37.5279 95.3778 51.8648C89.202 42.2544 93.7078 31.4781 88.4457 21.4265C84.7276 15.1246 85.1057 6.45947 83.2781 0C78.4257 10.1146 78.2366 24.8611 83.3727 35.3223C89.8321 44.0189 93.0461 50.762 97.426 61.5698C99.0014 64.9413 99.5056 66.6743 95.5669 61.0971C89.0129 48.9974 81.8287 44.6176 71.3675 39.387C69.5085 38.1581 67.7124 37.2759 66.7986 38.6308C67.4603 50.5099 78.3942 57.9777 87.595 60.1203C96.6697 62.5781 101.774 70.6445 106.469 79.1836C107.478 81.2317 106.217 80.3495 104.579 78.8685C102.909 77.4191 100.987 75.2764 100.545 75.1189C98.2767 73.3858 95.882 71.8734 93.3297 70.7391C90.872 69.7623 70.8949 64.3426 74.676 71.7474C86.6497 93.0478 99.7262 71.9994 110.944 86.935C114.63 92.8903 119.294 98.5305 123.138 104.202C119.325 103.761 114.567 98.2469 110.219 96.4509C100.136 94.0877 90.4938 89.9914 80.7574 85.7691C75.4953 84.2567 84.9797 96.6714 95.3778 104.076C95.756 104.36 96.1341 104.612 96.5122 104.864C97.3629 105.431 98.1822 105.967 99.0329 106.439C98.7178 106.786 98.4028 107.133 98.0877 107.479H90.998H90.8404H83.4987H81.5766H65.4437C64.9711 106.849 64.4984 106.219 63.9943 105.62C61.3475 101.398 63.8367 99.5388 67.2398 96.8605C70.5798 94.1507 74.9911 90.8107 74.8336 82.8387C75.3377 82.4921 73.4472 61.5067 69.8235 70.0458C65.6328 80.2234 60.4967 90.9052 61.7571 102.154C39.8894 88.0378 55.4867 74.016 39.0072 60.0573C26.0567 50.4784 35.4151 62.6411 35.0054 68.4704C35.7932 77.9232 44.3008 83.5319 48.8382 90.5901C41.3074 87.8172 39.2907 78.4589 30.405 79.3727C27.9788 80.0974 13.1063 79.2782 18.2423 82.3031C30.0899 92.9533 41.843 83.9731 52.9974 96.4509C58.8267 101.713 43.7336 92.1026 41.3704 93.678C35.5411 93.7726 27.6007 97.7743 23.851 102.375C37.0851 108.551 50.6342 88.731 62.923 107.448H60.8748C59.4254 106.628 57.7554 105.62 57.3773 105.652C55.2346 103.73 46.3174 105.053 40.173 107.448H4V109.748H35.6987H37.3056H54.2893H67.1137H79.4655H80.7574H86.8072H87.7525H95.945H96.9848H127.738H131.141H136.466H137.821H139.68H141.634H146.549H148.219H188.174H190.789H198.036H199.832H218.108H219.368H319.096V107.448H220.502V107.479ZM192.742 95.159C197.689 79.2151 208.403 88.3844 219.4 88.6365C217.351 91.1573 213.381 91.3148 210.924 93.8356C206.355 97.6798 200.368 97.8373 194.791 97.0811C196.429 93.1424 201.03 91.6929 204.401 89.8024C200.966 88.1954 191.671 98.7511 192.742 95.159ZM195.767 45.4053C196.587 54.4801 194.286 67.1154 184.518 69.9513C184.077 69.006 187.827 64.8783 188.363 63.4918L188.394 63.5233C189.875 60.5614 193.751 56.7173 192.995 52.9991C190.663 58.1037 187.008 64.0275 183.195 67.4936C186.252 59.9628 189.907 51.1716 195.767 45.4053ZM160.445 51.8963C157.578 50.3208 152.82 46.2246 149.952 44.8697C152.788 48.3357 157.893 50.2893 160.351 53.7869C158.46 54.2595 152.158 50.7935 150.457 49.344C150.583 50.4154 137.758 36.7402 141.098 37.654C146.234 41.12 153.103 42.0023 157.798 46.3191C158.681 46.7918 163.439 53.2827 160.445 51.8963ZM167.283 48.3672C166.684 44.8066 165.959 40.8049 166.148 40.2693C164.793 38.3787 166.527 48.7769 166.4 49.9112C159.72 42.1283 164.289 33.0851 164.258 24.0103C164.289 23.4431 164.762 23.4746 165.046 23.9473C173.27 28.5162 170.213 67.1785 167.283 48.3672ZM150.803 63.4288C153.765 64.2481 155.404 63.3973 160.351 64.8467C163.344 65.5715 165.739 66.4853 163.502 66.6743C156.569 67.8402 148.314 68.3443 142.611 64.122C148.503 61.8218 157.609 60.3724 163.628 63.9645C168.638 66.9579 151.969 61.1601 150.803 63.4288ZM163.281 77.9232C166.653 77.9232 170.276 78.2383 173.175 80.0344C166.59 82.7757 159.09 82.7127 152.725 79.5617C148.724 76.9149 156.79 76.9464 158.555 76.2217C163.911 75.0559 170.906 74.1736 175.223 78.5849C174.656 78.3644 161.485 75.8751 163.281 77.9232ZM180.233 98.3415C174.908 95.8837 169.205 93.8356 163.659 92.1026C168.606 95.4426 175.538 96.1673 180.265 100.201C169.93 103.509 161.264 96.2303 155.467 88.3214C164.006 88.605 173.9 91.8505 180.769 97.3647C182.092 98.2469 181.903 99.6018 180.233 98.3415ZM124.682 45.1217C122.098 53.2827 118.789 64.7207 109.589 67.1785C109.148 66.0126 113.118 61.9164 113.779 60.6245L113.811 60.656C115.512 57.8201 119.703 54.7637 119.987 51.1401C116.363 55.4569 112.235 60.9711 108.36 64.2796C111.196 56.6543 117.498 48.4933 124.682 45.1217ZM90.2418 37.7485C88.4772 39.7651 84.8851 22.9075 84.1289 20.9539C84.0029 27.3818 87.4689 33.6207 88.4457 39.5761C86.24 39.1349 82.4274 30.0286 81.7972 26.6256C80.4108 28.4217 81.104 -0.504153 83.3727 4.31681C83.4357 16.1959 91.2816 25.5858 90.2418 37.7485ZM100.01 28.7052C99.6946 26.0269 95.819 37.4964 95.6299 38.7568C94.5271 32.2343 96.0395 24.8611 100.577 21.7731C102.814 21.0484 108.328 12.5408 109.368 14.4944C108.328 26.0584 101.554 34.4085 96.8903 44.5231C94.212 45.7834 99.5056 28.1066 100.01 28.7052ZM84.9797 52.5265C81.23 49.3125 76.8187 44.8697 76.0309 45.878C78.7093 49.092 80.3478 49.2495 85.2633 53.9129C93.7078 60.782 85.2002 56.9063 81.2615 55.8035C75.1172 53.6608 69.9496 46.2561 67.8069 40.0487C68.3111 38.7568 69.6975 40.4268 70.4853 40.6474C77.1023 45.1533 83.9714 47.0438 88.7608 54.3541C91.5967 58.0407 88.7293 55.7405 84.9797 52.5265ZM87.9731 73.9215C91.5022 74.8668 95.6299 75.9066 98.9384 78.5534C91.061 82.3346 83.0576 79.7823 76.6611 72.8187C71.9347 66.4853 80.9149 70.3924 82.711 69.7938C89.0129 69.9198 96.4492 71.5268 100.861 76.8204C101.081 77.23 85.7674 70.739 87.9731 73.9215ZM71.336 70.676C74.2979 80.0029 74.0143 91.882 65.0656 96.766C64.4984 95.9467 67.4288 91.2203 67.7124 89.7708L67.7754 89.8024C68.7207 86.6829 71.6826 82.2716 70.2332 78.711C68.9413 84.3512 66.515 90.5901 63.4271 94.6548C65.1601 86.7459 66.9562 77.5451 71.336 70.676ZM41.3074 73.0077C39.6058 71.5898 43.8281 80.8536 43.9542 81.988C35.7302 76.4108 37.8098 66.4537 33.5245 58.4503C33.3039 57.9146 33.7766 57.7571 34.2492 58.0722C48.5861 62.2315 52.2097 104.391 41.3074 73.0077ZM28.0103 82.9963C30.9407 84.7923 36.2343 84.8869 39.0702 87.3131C37.3056 88.3529 31.1613 87.0925 29.3652 86.7144C28.672 86.9665 25.4265 85.1704 22.6852 83.847C12.8542 79.8138 25.7416 80.9482 29.6803 80.2865C33.43 80.3495 37.2741 81.4523 39.6058 85.0759C40.2045 86.998 29.8379 82.3976 28.0103 82.9963ZM41.0238 97.3647C54.2578 96.7029 27.1911 104.517 24.8278 102.123C29.6488 98.0579 37.4002 93.9301 43.9857 95.7262C47.2312 96.6084 44.2378 96.4824 40.4566 96.703C36.6755 96.892 32.2956 97.7428 31.9805 98.7511C34.8479 98.5305 36.1083 97.4277 41.0238 97.3647ZM57.6924 106.912C57.3458 106.881 52.1152 107.007 48.6806 107.479H42.7253C47.4517 105.526 53.155 104.013 57.6924 106.912ZM123.894 93.5205C120.932 78.5534 136.718 81.4523 146.108 77.4506C140.657 83.9731 136.057 93.0794 126.667 94.7494C126.446 90.1174 130.259 87.1555 132.78 84.2567C128.463 84.0991 124.398 97.4277 123.894 93.5205ZM98.2767 104.517C97.7726 104.265 97.2999 103.982 96.7958 103.667C90.998 100.074 85.7674 93.9301 82.1123 88.6365C81.8602 87.2501 123.642 102.564 113.527 101.272C106.627 99.9484 99.5371 98.0579 92.9201 95.5371C99.5686 100.421 107.509 100.137 114.63 103.509C110.345 107.07 105.744 107.416 101.302 105.841C100.86 105.683 100.419 105.526 99.9782 105.337C99.4426 105.116 98.8754 104.832 98.2767 104.517ZM112.519 107.479C116.93 104.36 120.964 105.085 124.682 107.479H112.519ZM142.453 107.479C142.453 107.448 142.485 107.448 142.485 107.416C143.997 103.478 147.495 100.673 148.503 96.6084C145.699 100.043 142.642 103.446 140.657 107.511H137.506C137.758 97.0496 156.002 81.2948 151.906 95.222C150.866 98.625 147.967 101.272 147.904 105.116C147.967 105.904 147.841 106.723 147.621 107.479H142.453ZM203.078 107.479C207.804 104.801 213.602 103.824 217.982 105.337C219.053 106.061 219.494 106.786 219.494 107.479H203.078Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

const FlowersCoverDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 322 87"
    fill="none"
    {...props}
  >
    <g>
      <path
        d="M237.428 11.7619C241.039 12.5796 244.022 12.3909 247.381 11.4789C249.171 11.2588 257.712 6.06967 260.444 2.13854H318V0H261.292H260.538H252.217H247.224H218.776H216.295H211.366H207.598H202.762H198.46H197.173H189.448H185.461H182.729H180.656H179.181H177.956H174.314H169.133H148.189H145.802H141.187H139.805H4V2.13854H140.213H144.295H169.258C169.258 2.48447 169.227 2.86186 169.195 3.2078C169.007 6.50995 165.49 7.64212 163.575 9.52906C153.307 16.6994 158.362 34.6568 163.857 43.3682C164.705 43.4626 164.705 42.6449 164.799 42.0159C166.715 34.877 167.657 27.2663 169.792 20.5048C173.968 14.1206 169.98 7.70502 171.331 2.10709H171.55C176.637 11.2902 186.779 24.2472 175.507 32.0466C169.949 37.1413 168.348 44.7205 171.833 52.0796C175.381 57.1429 178.835 45.0665 180.374 44.1545C186.56 36.2922 181.002 19.8443 183.608 23.7126C191.866 34.4682 188.381 44.406 184.864 55.7592C184.456 60.7596 185.461 69.3766 190.39 72.3643C193.436 71.7982 192.4 64.6592 193.844 62.8666C199.371 54.1238 186.528 29.1218 192.18 37.8646C193.782 40.5693 196.388 44.6891 197.173 45.7898C201.851 51.8595 200.313 59.5645 205.4 65.6027C210.172 71.8925 217.834 77.6162 225.276 79C225.778 78.2452 224.522 77.2389 223.831 76.5784C218.839 72.0812 216.264 66.1059 213.312 60.3822C209.325 53.8408 200.627 51.2619 198.115 43.6198C208.194 52.6457 215.322 59.2185 229.703 53.3376C233.189 52.4256 236.423 51.7651 232.749 49.8467C214.411 38.7767 197.644 54.4697 188.475 27.1091C198.429 32.6441 210.455 28.8702 220.095 24.3101C227.505 20.9136 212.276 20.2846 210.361 19.7185C184.079 19.2468 194.692 43.2424 174.471 2.35868C175.727 2.01274 177.297 3.30215 178.521 4.11982C185.115 10.0008 192.463 8.0824 197.047 2.16998H197.612C193.436 5.69228 192.683 13.4287 189.26 17.58C188.852 18.3033 187.659 18.838 188.946 20.379C190.924 23.115 198.24 17.7058 201.757 18.5864C211.742 19.121 215.416 10.8499 212.433 2.83041C212.37 2.61027 212.308 2.35868 212.245 2.10709H218.462C222.795 6.35271 227.348 10.4096 232.309 13.6174C234.853 15.756 235.826 17.297 235.763 18.9638C232.215 28.3985 227.066 33.2416 236.58 45.8213C237.961 48.3372 248.166 61.2313 246.879 53.0545C245.686 40.758 243.927 27.9268 236.611 16.9825C240.568 18.0203 244.995 21.4482 249.046 22.6748C267.509 30.0338 269.518 53.1174 292.692 53.8722C298.375 54.6584 296.397 52.8029 292.378 49.1863C287.291 44.9721 287.071 41.67 282.298 38.4622C275.202 32.707 265.122 30.7886 257.9 25.8511C280.194 32.1409 279.221 35.1286 302.834 26.8575C312.505 24.2158 284.779 22.4232 282.235 22.7691C274.574 22.4546 267.352 27.2663 259.784 24.3416C260.098 24.7504 237.365 16.8252 251.212 19.9072C263.866 23.5868 271.088 18.7751 278.216 10.8814C287.699 -0.849124 259.502 11.3531 257.272 14.781C249.611 20.2532 240.065 16.951 232.404 11.2902C229.452 8.93153 236.454 11.6047 237.428 11.7619ZM163.324 39.9717C158.551 29.908 155.756 14.0892 167.939 8.99443C167.531 15.6616 163.198 22.0143 163.7 28.9646C165.082 22.7377 167.186 16.5422 169.321 10.5669C173.56 3.01911 164.831 40.0032 163.324 39.9717ZM202.668 54.7213C206.185 58.2436 208.288 64.0303 212.559 67.1752C211.774 65.4769 202.636 54.4697 204.991 54.1553C213.972 58.9984 215.353 70.037 222.638 76.547C224.208 78.5283 220.346 76.5784 216.044 73.8109C211.931 70.8232 207.378 67.1752 207.378 66.2002C205.651 63.9359 201.663 56.7341 202.668 54.7213ZM204.206 45.7269C211.428 46.3873 218.745 45.7898 225.778 47.8025C227.254 48.4315 233 49.8153 232.278 51.545C223.894 53.1174 214.16 57.426 207.503 49.375C208.571 49.8153 218.745 52.2683 217.08 50.7273C217.3 51.3248 201.883 47.205 204.206 45.7269ZM190.736 50.8846C191.144 56.8284 190.328 58.1807 190.987 61.7345C192.18 61.5458 191.615 56.1365 191.552 51.7022C191.458 47.2679 191.458 43.9972 192.431 47.8654C194.849 54.8471 192.117 61.5772 191.207 68.5275C190.861 69.2508 191.144 71.1063 189.982 70.9176C187.878 68.3388 187.156 63.4956 186.308 60.4765C185.147 56.7655 191.238 38.2735 190.736 50.8846ZM219.844 23.0521C213.25 27.2349 203.955 28.713 196.168 27.9582C200.941 26.0713 207.284 25.1592 212.59 24.1214C209.796 22.7377 205.18 24.7504 201.946 25.002V25.0649C200.564 25.0963 195.226 26.6373 194.567 25.8197C201.098 19.4984 211.868 21.0709 219.844 23.0521ZM182.509 29.1533C184.142 35.2858 181.065 41.5756 177.799 46.4502C176.355 47.6768 174.062 56.4196 172.178 50.1298C170.357 42.3619 173.623 34.3738 180.154 30.0653C180.374 33.7448 178.898 37.4873 177.673 40.6636C178.741 43.9658 182.478 28.3356 182.509 29.1533ZM181.724 2.13854C183.168 2.57882 184.676 2.51592 186.151 2.23288C183.357 3.64809 180.782 3.61664 179.212 2.13854H181.724ZM180.719 4.56011C178.364 3.3336 185.461 3.45939 189.794 2.16998H195.477C192.086 6.10111 188.192 8.42834 180.719 4.56011ZM190.516 19.6557C190.014 18.3033 190.799 17.8316 191.27 17.2026C194.692 11.6676 196.545 5.44068 201.663 2.13854H207.817C207.692 6.03822 205.086 9.05732 203.547 11.9821C206.53 11.9506 208.1 5.31489 209.262 2.13854H211.114C216.484 18.4291 201.506 15.9447 190.516 19.6557ZM277.337 41.1353C280.257 42.0474 269.613 34.1851 268.922 33.1787C281.482 35.9148 284.842 45.4124 293.822 52.3941C294.324 52.8344 293.853 53.1489 293.163 52.9916C278.719 51.5764 270.084 42.0159 263.144 31.4176C263.019 29.0904 277.463 41.4184 277.337 41.1353ZM283.9 24.1214C300.416 25.3794 312.693 24.1214 287.448 30.4112C285.658 32.3925 267.823 29.5935 272.784 28.0525C276.74 27.8639 284.339 28.1469 288.107 27.2978C282.926 26.543 276.489 27.9896 271.34 26.4172C273.067 24.7504 281.607 24.2472 283.9 24.1214ZM258.214 16.668C264.023 11.7619 271.277 7.32763 279.158 7.42197C275.61 13.24 267.854 19.467 260.193 19.2154C253.128 19.2154 272.784 15.6616 272.376 12.7683C271.748 13.1457 254.949 20.2217 258.214 16.668ZM237.396 31.9837L237.333 31.9522C238.213 35.8519 237.742 41.2926 241.29 44.3117C239.469 38.6823 238.15 30.6314 239.186 25.5681C242.452 31.7006 241.667 37.676 244.241 43.9658C245.152 47.1736 245.874 50.1927 244.838 52.8973C237.867 46.1043 228.479 32.3925 236.109 23.744C237.239 24.4674 236.862 30.3483 237.396 31.9837ZM259.219 2.13854C257.9 3.30215 256.079 4.52866 255.577 5.25199C251.212 9.46616 244.775 13.0828 238.37 10.8814C239.123 10.8185 253.159 7.07604 249.956 5.88097C246.848 7.48487 243.205 8.90008 239.217 8.49124C241.133 5.78662 243.708 3.71099 246.565 2.16998H259.219V2.13854ZM220.88 2.13854H243.174C235.544 7.04459 232.466 13.5231 220.88 2.13854Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

// ============================================================================
// COMPONENTES DE ESTADO (EXTRAÍDOS PARA EVITAR ERRORES DE RENDERIZADO)
// ============================================================================

const TicketCard: FC<StateCardProps> = ({
  guestData,
  invitationData,
  textClassName,
}) => {
  // TODO Corregir el toDate ya que es un Timestamp de Firestore, y da problemas de compatibilidad. Se debe parsear correctamente.
  const dateObj = invitationData?.fecha?.toDate?.() || new Date();
  const formattedDate = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[400px] mx-auto flex flex-col items-center gap-6"
    >
      {/* TICKET FÍSICO PREMIUM */}
      <div className="w-full bg-[#FDFBF7] rounded-xl shadow-2xl relative overflow-hidden border border-[#EBE5DA]">

        {/* Ornamentos Superiores y Título */}
        <div className="pt-8 pb-5 px-8 flex flex-col items-center">
          <p className="text-[9px] font-bold text-stone-500 uppercase tracking-[0.3em] mb-4 border border-stone-200 px-5 py-1.5 rounded-full bg-white shadow-sm">
            ✦ Pase de Acceso ✦
          </p>

          <p
            className={cn(
              "font-serif text-3xl text-charcoal text-center leading-tight mb-2",
              textClassName,
            )}
          >
            {invitationData?.nombre || "Nuestra Boda"}
          </p>
          <p className="text-[9px] text-stone-400 uppercase tracking-[0.2em] text-center">
            {formattedDate.replace(/,/g, " •")}
          </p>
        </div>

        {/* Recorte Lateral (Notches) y Línea Punteada */}
        <div className="relative h-8 flex items-center justify-center">
          <div className="absolute -left-4 w-8 h-8 bg-accent rounded-full shadow-inner border-r border-[#EBE5DA]" />
          <div className="w-full border-t border-dashed border-stone-300 mx-6 opacity-60" />
          <div className="absolute -right-4 w-8 h-8 bg-accent rounded-full shadow-inner border-l border-[#EBE5DA]" />
        </div>

        {/* Detalles del Invitado y QR */}
        <div className="pt-6 pb-6 px-8 flex flex-col items-center">
          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.25em] mb-3">
            Invitado
          </p>
          <p className="font-serif text-3xl text-[#2C2C29] text-center italic mb-4">
            {guestData.nombre}
          </p>
          {guestData.confirmados && (
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em] flex items-center justify-center gap-2">
              {guestData.confirmados} Pase{guestData.confirmados > 1 ? "s" : ""}{" "}
              Confirmado{guestData.confirmados > 1 ? "s" : ""}{" "}
            </p>
          )}

          {/* Contenedor del QR */}
          <div className="mx-auto w-48 h-48 bg-white rounded-xl shadow-sm border border-stone-200 flex items-center justify-center mt-8 mb-4 p-4 relative transition-transform hover:scale-[1.02] duration-300">
            <QrCode size={160} className="text-[#2C2C29]" strokeWidth={1} />
          </div>

          <p className="text-[9px] text-stone-400 uppercase tracking-[0.25em] text-center mb-8 max-w-[50ch]">
            Presenta este QR en la entrada para agilizar tu acceso.
          </p>

          {/* FLOR INFERIOR */}
          <div className="w-full flex justify-center mb-6">
            <FlowersCoverDown className="w-[85%] h-auto text-stone-300 opacity-80" />
          </div>

          {/* Footer del Ticket */}
          <div className="w-full border-t border-dashed border-stone-300/60 pt-4 flex flex-col items-center">
            <p className="text-[9px] text-stone-400 uppercase tracking-[0.2em] text-center mb-1">
              {invitationData?.recepcion?.nombreSalon || "Recepción"} •{" "}
              {dateObj.getFullYear()}
            </p>
            <p className="text-[8px] text-stone-400 uppercase tracking-[0.2em] text-center opacity-70">
              Generado por JN Invitaciones
            </p>
          </div>
        </div>

        {/* Borde dentado inferior (Fringe) simulado con CSS puro */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[linear-gradient(to_right,#EBE5DA_2px,transparent_2px)] bg-[size:6px_100%] opacity-60" />
      </div>
    </motion.div>
  );
};

const DeclineCard: FC<StateCardProps> = ({ guestData, textClassName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[400px] mx-auto bg-white rounded-xl shadow-xl relative overflow-hidden border border-stone-200 p-10 flex flex-col items-center text-center"
    >
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-300 opacity-60" />

      <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 border border-stone-200 shadow-sm">
        <XCircle size={32} className="text-stone-400" strokeWidth={1.5} />
      </div>
      <p
        className={cn(
          "text-[10px] font-bold text-stone-400 uppercase tracking-[0.25em] mb-4",
          textClassName,
        )}
      >
        Lamentamos tu ausencia
      </p>
      <p className="font-serif text-[32px] text-charcoal leading-tight mb-6">
        {guestData.nombre}
      </p>
      <div className="w-16 h-px bg-stone-300 mb-6" />
      <p className="text-stone-500 text-sm leading-relaxed mb-8 italic">
        &quot;Tal vez no puedan acompañarnos físicamente, pero los llevaremos en
        el alma de nuestra fiesta y en nuestros corazones.&quot;
      </p>
      <p className="font-newIconScript text-4xl text-stone-500 drop-shadow-sm mt-2">
        ¡Nos vemos pronto!
      </p>
    </motion.div>
  );
};

const ClosedCard: FC<StateCardProps> = ({ textClassName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[400px] mx-auto bg-white rounded-xl shadow-xl relative overflow-hidden border border-stone-200 p-10 flex flex-col items-center text-center"
    >
      <p className={cn("text-lg font-medium text-stone-600", textClassName)}>
        El registro de asistencia ha sido cerrado.
      </p>
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Assistants: FC<Props> = ({
  containerClassName = "",
  textClassName = "",
  svgsColor,
  sendFormBtnClassName = "",
  sealImage,
}) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAssistant, setIsAssistant] = useState(false);
  const [guestData, setGuestData] = useState<Guest>(defaultGuest);

  const invitationData = useInvitationStore((state) => state.invitationData);
  const formikRef = useRef<FormikProps<GuestFormData>>(null);
  const searchParams = useSearchParams();
  const id = searchParams?.get("guest");

  const isExpiredLocal = () => {
    if (!guestData?.fechaLimiteConfirmacion) return false;
    const dateFormatted = new Date().toLocaleDateString("en-CA");
    return guestData.fechaLimiteConfirmacion < dateFormatted;
  };

  const isFormLocked =
    guestData.cambiosPermitidos === false || isExpiredLocal();

  const handleGetGuestData = useCallback(
    (id: string) => {
      if (!isDefaultId(id) && invitationData) {
        GuestService.getGuest(invitationData.id, id).then(
          ({ guest, error }) => {
            if (error || !guest) {
              setGuestData(defaultGuest);
              return;
            }
            GuestQuotesService.getGuestQuote(invitationData.id, id).then(
              ({ result, error }) => {
                const guestDataCopy = { ...guest };
                if (!error && result !== null) {
                  guestDataCopy.notaInvitado = result.mensaje;
                }
                setGuestData(guestDataCopy);
                formikRef.current?.setValues({
                  ...guestDataCopy,
                  telefono: null,
                });

                if (guestDataCopy.asistencia !== null) {
                  setIsFormSubmitted(true);
                  setIsAssistant(guestDataCopy.asistencia === true);
                }
              },
            );
          },
        );
      }
    },
    [invitationData],
  );

  useEffect(() => {
    if (id) {
      handleGetGuestData(id);
    }
  }, [id, handleGetGuestData]);

  if (!guestData) {
    return (
      <div
        className={cn(
          "w-full h-24 bg-accent flex justify-center",
          containerClassName,
        )}
      >
        <p className={cn("text-primary font-newIconScript", textClassName)}>
          Cargando información...
        </p>
      </div>
    );
  }

  return (
    <div>
      <hr className="w-full border-sand/50" />
      <div
        className={cn(
          "bg-accent flex flex-col items-center justify-center py-20",
          containerClassName,
        )}
      >
        <AnimatedEntrance>
          <div className="flex flex-col items-center justify-center gap-4 pb-8">
            <Separator className="mx-10" color={svgsColor} />
            <p
              className={cn(
                "pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-primary px-5 text-center",
                textClassName,
              )}
            >
              Confirmación de asistencia
            </p>
            {!isFormLocked && !isFormSubmitted && (
              <p className="font-nourdLight text-sm text-center px-10 max-w-sm text-stone-600">
                Tu lugar te espera. Por favor, confirma tu asistencia a
                continuación.
              </p>
            )}
          </div>
        </AnimatedEntrance>

        <AnimatedEntrance classname="w-full">
          <div className="flex flex-col items-center justify-center px-5 w-full">
            {/* LÓGICA DE VISTAS PRINCIPALES */}
            {isFormLocked ? (
              guestData.asistencia === true ? (
                <TicketCard
                  guestData={guestData}
                  invitationData={invitationData}
                  textClassName={textClassName}
                />
              ) : guestData.asistencia === false ? (
                <DeclineCard
                  guestData={guestData}
                  textClassName={textClassName}
                />
              ) : (
                <ClosedCard
                  guestData={guestData}
                  textClassName={textClassName}
                />
              )
            ) : !isFormSubmitted ? (
              // ============================================================================
              // FORMULARIO DE CONFIRMACIÓN ELEGANTE (REDESIGN)
              // ============================================================================
              <div className="w-full max-w-[400px] relative z-0">
                {/* SELLO DE CARTA */}
                <div className="flex justify-center -mb-10 relative z-10">
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-24 h-24"
                    >
                      <Image
                        alt="Sello de carta"
                        className="w-full h-full object-contain drop-shadow-md"
                        width={100}
                        height={100}
                        sizes="100vw"
                        src={sealImage || `/img/sello.png`}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* TARJETA BLANCA DEL FORMULARIO */}
                <div className="rounded-xl bg-white shadow-xl px-6 py-12 pt-16 relative z-0 border border-stone-200">
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "flex flex-col items-center text-primary",
                        textClassName,
                      )}
                      key="assistance-form"
                    >
                      {/* TÍTULO PRINCIPAL (Nombre elegante) */}
                      <p
                        className={cn(
                          "text-3xl drop-shadow-[1px_1px_1px_rgba(0,0,0,0.05)] font-newIconScript text-charcoal text-center mb-4",
                          textClassName,
                        )}
                      >
                        {guestData.nombre}
                      </p>

                      {guestData.notaAnfitrion && (
                        <p className="px-4 text-center text-sm italic text-stone-500 my-2 font-serif leading-relaxed">
                          &quot;{guestData.notaAnfitrion}&quot;
                        </p>
                      )}

                      <Formik
                        innerRef={formikRef}
                        validationSchema={assistanceSchema(
                          Number(guestData.invitados),
                        )}
                        initialValues={{ ...guestData, telefono: null }}
                        onSubmit={(data: GuestFormData) => {
                          setIsDisabled(true);
                          if (!isDefaultId(data.id) && invitationData) {
                            GuestService.saveGuest(
                              invitationData.id,
                              data.id!,
                              data,
                              false,
                              true,
                            )
                              .then(() => {
                                setIsFormSubmitted(true);
                                setIsAssistant(data.asistencia === true);
                                if (data.notaInvitado) {
                                  GuestQuotesService.saveGuestQuote(
                                    invitationData.id,
                                    data.id!,
                                    {
                                      autor: data.nombre,
                                      mensaje: data.notaInvitado || "",
                                    },
                                  );
                                }
                                ActivityService.logActivity(invitationData.id, {
                                  action:
                                    data.asistencia === true
                                      ? "confirm"
                                      : "decline",
                                  guestId: data.id!,
                                  confirmedGuests:
                                    data.asistencia === true &&
                                    data.confirmados &&
                                    data.confirmados > 0
                                      ? data.confirmados
                                      : null,
                                });
                                setGuestData({
                                  ...data,
                                  id: data.id!,
                                  tieneTelefono: false,
                                  fechaCreacion: null,
                                  ultimaModificacion: null,
                                });
                              })
                              .catch(() => setIsDisabled(false));
                          } else {
                            setIsFormSubmitted(true);
                            setIsAssistant(data.asistencia === true);
                            setGuestData({
                              ...defaultGuest,
                              asistencia: data.asistencia,
                              confirmados: data.confirmados,
                              notaInvitado: data.notaInvitado,
                            });
                            setIsDisabled(false);
                          }
                        }}
                      >
                        {({ values, handleSubmit, setFieldValue }) => {
                          const hasSelectedOption =
                            values.asistencia !== null &&
                            values.asistencia !== undefined;
                          const isAttending = values.asistencia === true;

                          return (
                            <form
                              onSubmit={handleSubmit}
                              className="w-full flex flex-col items-center"
                            >
                              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 text-center mt-2">
                                ¿Confirmas tu asistencia?
                              </p>

                              {/* BOTONES SEGMENTADOS ELEGANTES */}
                              <div className="flex flex-col sm:flex-row gap-4 w-full mb-8">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFieldValue("asistencia", true);
                                    if (!values.confirmados)
                                      setFieldValue(
                                        "confirmados",
                                        Number(guestData.invitados),
                                      );
                                  }}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-3 py-3.5 rounded-full transition-all duration-300 font-medium text-sm border",
                                    values.asistencia === true
                                      ? "bg-[#2C2C29] border-[#2C2C29] text-white shadow-md"
                                      : "bg-transparent border-stone-300 text-stone-500 hover:border-stone-400 hover:text-stone-600",
                                  )}
                                >
                                  <span className="text-lg">🥂</span> Sí, ahí
                                  estaré
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setFieldValue("asistencia", false);
                                    setFieldValue("confirmados", 0);
                                  }}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-3 py-3.5 rounded-full transition-all duration-300 font-medium text-sm border",
                                    values.asistencia === false
                                      ? "bg-stone-100 border-stone-300 text-stone-600 shadow-inner"
                                      : "bg-transparent border-stone-300 text-stone-500 hover:border-stone-300 hover:text-stone-600",
                                  )}
                                >
                                  <span className="text-lg opacity-80 grayscale">
                                    🤍
                                  </span>{" "}
                                  No podré ir
                                </button>
                              </div>

                              <AnimatePresence>
                                {hasSelectedOption && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{
                                      duration: 0.4,
                                      ease: "easeInOut",
                                    }}
                                    className="w-full flex flex-col items-center"
                                  >
                                    <AnimatePresence initial={false}>
                                      {isAttending && (
                                        <motion.div
                                          key="confirmados-stepper"
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                          }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="w-full flex flex-col items-center mb-10 overflow-hidden"
                                        >
                                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 text-center mt-2">
                                            Número de pases
                                          </p>
                                          {values.confirmados != null && (
                                            <div className="flex items-center justify-center gap-8 md:gap-12">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const currentConfirmados =
                                                    values.confirmados ?? 0;
                                                  if (currentConfirmados > 1) {
                                                    setFieldValue(
                                                      "confirmados",
                                                      currentConfirmados - 1,
                                                    );
                                                  }
                                                }}
                                                disabled={
                                                  (values.confirmados ?? 0) <= 1
                                                }
                                                className="w-12 h-12 flex items-center justify-center rounded-full border border-stone-400 text-stone-500 disabled:opacity-20 disabled:border-stone-300 disabled:text-stone-300 transition-all active:scale-95 hover:bg-stone-100 hover:text-charcoal hover:border-charcoal"
                                              >
                                                <Minus
                                                  size={18}
                                                  strokeWidth={2}
                                                />
                                              </button>

                                              <div className="flex flex-col items-center justify-center min-w-[4rem]">
                                                <span className="font-serif text-5xl text-charcoal font-bold leading-none">
                                                  {values.confirmados ?? 0}
                                                </span>
                                                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-2">
                                                  Pase(s)
                                                </span>
                                              </div>

                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const currentConfirmados =
                                                    values.confirmados ?? 0;
                                                  if (
                                                    currentConfirmados <
                                                    Number(guestData.invitados)
                                                  ) {
                                                    setFieldValue(
                                                      "confirmados",
                                                      currentConfirmados + 1,
                                                    );
                                                  }
                                                }}
                                                disabled={
                                                  (values.confirmados ?? 0) >=
                                                  Number(guestData.invitados)
                                                }
                                                className="w-12 h-12 flex items-center justify-center rounded-full border border-stone-400 text-stone-500 disabled:opacity-20 disabled:border-stone-300 disabled:text-stone-300 transition-all active:scale-95 hover:bg-stone-100 hover:text-charcoal hover:border-charcoal"
                                              >
                                                <Plus
                                                  size={18}
                                                  strokeWidth={2}
                                                />
                                              </button>
                                            </div>
                                          )}

                                          {/* STEPPER NUMÉRICO PREMIUM */}
                                          {guestData.invitados > 1 && (
                                            <p className="text-[10px] text-stone-400 mt-5 font-medium italic">
                                              Límite asignado:{" "}
                                              {guestData.invitados} pases
                                            </p>
                                          )}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* INPUT TEXTO MINIMALISTA */}
                                    <div className="w-full mb-10 mt-2 text-left">
                                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] mb-3">
                                        {values.asistencia === true
                                          ? "Restricciones alimenticias / Felicitación"
                                          : "Mensaje para los novios"}{" "}
                                        <span className="font-normal italic tracking-normal opacity-80">
                                          (opcional)
                                        </span>
                                      </label>
                                      <textarea
                                        name="notaInvitado"
                                        value={values.notaInvitado || ""}
                                        onChange={(e) =>
                                          setFieldValue(
                                            "notaInvitado",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full bg-transparent border-b border-sand py-2 text-sm text-[#2C2C29] placeholder:text-stone-300 focus:border-stone-500 outline-none resize-none transition-colors"
                                        rows={1}
                                        style={{ fieldSizing: "content" }}
                                        placeholder="Escribe aquí tu mensaje..."
                                      />
                                    </div>

                                    {/* BOTÓN SUBMIT ELEGANTE */}
                                    <button
                                      type="submit"
                                      disabled={isDisabled}
                                      className={cn(
                                        "w-full bg-[#2C2C29] text-white py-4 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#1a1a18] transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                                        sendFormBtnClassName,
                                      )}
                                    >
                                      Confirmar Asistencia{" "}
                                      <ArrowRight size={16} />
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </form>
                          );
                        }}
                      </Formik>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            ) : // RESULTADOS DESPUÉS DE HACER CLICK EN ENVIAR (Y form no está bloqueado)
            guestData.asistencia === true ? (
              <TicketCard
                guestData={guestData}
                invitationData={invitationData}
                textClassName={textClassName}
              />
            ) : (
              <DeclineCard
                guestData={guestData}
                textClassName={textClassName}
              />
            )}

            {/* BOTÓN FLOTANTE "MODIFICAR MI RESPUESTA" (Fuera de las tarjetas) */}
            {!isFormLocked &&
              isFormSubmitted &&
              guestData.asistencia !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8"
                >
                  <button
                    onClick={() => {
                      setIsFormSubmitted(false);
                      setIsDisabled(false);
                    }}
                    className="text-stone-500 font-medium text-xs uppercase tracking-widest border-b border-stone-300 hover:border-charcoal hover:text-charcoal transition-all pb-0.5"
                  >
                    Modificar mi respuesta
                  </button>
                </motion.div>
              )}
          </div>
        </AnimatedEntrance>
      </div>
    </div>
  );
};

export default Assistants;

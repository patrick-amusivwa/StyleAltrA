import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { GetStaticProps } from "next";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Button from "../components/Buttons/Button";
import { formatKes, roundDecimal } from "../components/Util/utilFunc";
import { siteConfig } from "../data/siteConfig";
import { useCart } from "../context/cart/CartProvider";
import Input from "../components/Input/Input";
import { itemType } from "../context/wishlist/wishlist-type";
import { useAuth } from "../context/AuthContext";

// let w = window.innerWidth;
type PaymentType = "CASH_ON_DELIVERY" | "MPESA";
type DeliveryType = "STORE_PICKUP" | "NAIROBI" | "OUTSIDE_NAIROBI";

type Order = {
  orderNumber: number;
  customerId: number;
  shippingAddress: string;
  township?: null | string;
  city?: null | string;
  state?: null | string;
  zipCode?: null | string;
  orderDate: string;
  paymentType: PaymentType;
  deliveryType: DeliveryType;
  totalPrice: number;
  deliveryDate: string;
};

const ShoppingCart = () => {
  const t = useTranslations("CartWishlist");
  const { cart, clearCart } = useCart();
  const auth = useAuth();
  const [deli, setDeli] = useState<DeliveryType>("STORE_PICKUP");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentType>("CASH_ON_DELIVERY");

  // Form Fields
  const [name, setName] = useState(auth.user?.fullname || "");
  const [email, setEmail] = useState(auth.user?.email || "");
  const [phone, setPhone] = useState(auth.user?.phone || "");
  const [password, setPassword] = useState("");
  const [diffAddr, setDiffAddr] = useState(false);
  const [address, setAddress] = useState(auth.user?.shippingAddress || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState("");
  const [sendEmail, setSendEmail] = useState(false);

  const products = cart.map((item) => ({
    id: item.id,
    quantity: item.qty,
  }));

  useEffect(() => {
    if (!isOrdering) return;

    setErrorMsg("");

    // if not logged in, register the user
    const registerUser = async () => {
      const regResponse = await auth.register!(
        email,
        name,
        password,
        address,
        phone
      );
      if (!regResponse.success) {
        setIsOrdering(false);
        if (regResponse.message === "alreadyExists") {
          setErrorMsg("email_already_exists");
        } else {
          setErrorMsg("error_occurs");
        }
        return false;
      }
    };
    if (!auth.user) registerUser();

    const makeOrder = async () => {
      setCompletedOrder({
        orderNumber: Date.now(),
        customerId: auth.user!.id,
        shippingAddress: shippingAddress || address,
        orderDate: new Date().toISOString(),
        paymentType: paymentMethod,
        deliveryType: deli,
        totalPrice: +subtotal,
        deliveryDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
      clearCart!();
      setIsOrdering(false);
    };
    if (auth.user) makeOrder();
  }, [isOrdering, completedOrder, auth.user]);

  useEffect(() => {
    if (auth.user) {
      setName(auth.user.fullname);
      setEmail(auth.user.email);
      setAddress(auth.user.shippingAddress || "");
      setPhone(auth.user.phone || "");
    } else {
      setName("");
      setEmail("");
      setAddress("");
      setPhone("");
    }
  }, [auth.user]);

  let disableOrder = true;

  if (!auth.user) {
    disableOrder =
      name !== "" &&
      email !== "" &&
      phone !== "" &&
      address !== "" &&
      password !== ""
        ? false
        : true;
  } else {
    disableOrder =
      name !== "" && email !== "" && phone !== "" && address !== ""
        ? false
        : true;
  }

  let subtotal: number | string = 0;

  subtotal = roundDecimal(
    cart.reduce(
      (accumulator: number, currentItem: itemType) =>
        accumulator + currentItem.price * currentItem!.qty!,
      0
    )
  );

  let deliFee = 0;
  if (deli === "NAIROBI") {
    deliFee = siteConfig.delivery.nairobi;
  } else if (deli === "OUTSIDE_NAIROBI") {
    deliFee = siteConfig.delivery.outsideNairobi;
  }

  return (
    <div>
      {/* ===== Head Section ===== */}
      <Header title={`Checkout - StyleAltra`} />

      <main id="main-content">
        {/* ===== Heading & Continue Shopping */}
        <div className="app-max-width px-4 sm:px-8 md:px-20 w-full border-t-2 border-gray100">
          <h1 className="text-2xl sm:text-4xl text-center sm:text-left mt-6 mb-2 animatee__animated animate__bounce">
            {t("checkout")}
          </h1>
        </div>

        {/* ===== Form Section ===== */}
        {!completedOrder ? (
          <div className="app-max-width px-4 sm:px-8 md:px-20 mb-14 flex flex-col lg:flex-row">
            <div className="h-full w-full lg:w-7/12 mr-8">
              {errorMsg !== "" && (
                <span className="text-red text-sm font-semibold">
                  - {t(errorMsg)}
                </span>
              )}
              <div className="my-4">
                <label htmlFor="name" className="text-lg">
                  {t("name")}
                </label>
                <Input
                  name="name"
                  type="text"
                  extraClass="w-full mt-1 mb-2"
                  border="border-2 border-gray400"
                  value={name}
                  onChange={(e) =>
                    setName((e.target as HTMLInputElement).value)
                  }
                  required
                />
              </div>

              <div className="my-4">
                <label htmlFor="email" className="text-lg mb-1">
                  {t("email_address")}
                </label>
                <Input
                  name="email"
                  type="email"
                  readOnly={auth.user ? true : false}
                  extraClass={`w-full mt-1 mb-2 ${
                    auth.user ? "bg-gray100 cursor-not-allowed" : ""
                  }`}
                  border="border-2 border-gray400"
                  value={email}
                  onChange={(e) =>
                    setEmail((e.target as HTMLInputElement).value)
                  }
                  required
                />
              </div>

              {!auth.user && (
                <div className="my-4">
                  <label htmlFor="password" className="text-lg">
                    {t("password")}
                  </label>
                  <Input
                    name="password"
                    type="password"
                    extraClass="w-full mt-1 mb-2"
                    border="border-2 border-gray400"
                    value={password}
                    onChange={(e) =>
                      setPassword((e.target as HTMLInputElement).value)
                    }
                    required
                  />
                </div>
              )}

              <div className="my-4">
                <label htmlFor="phone" className="text-lg">
                  {t("phone")}
                </label>
                <Input
                  name="phone"
                  type="text"
                  extraClass="w-full mt-1 mb-2"
                  border="border-2 border-gray400"
                  value={phone}
                  onChange={(e) =>
                    setPhone((e.target as HTMLInputElement).value)
                  }
                  required
                />
              </div>

              <div className="my-4">
                <label htmlFor="address" className="text-lg">
                  {t("address")}
                </label>
                <textarea
                  aria-label="Address"
                  className="w-full mt-1 mb-2 border-2 border-gray400 p-4 outline-none"
                  rows={4}
                  value={address}
                  onChange={(e) =>
                    setAddress((e.target as HTMLTextAreaElement).value)
                  }
                />
              </div>

              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  name="toggle"
                  id="toggle"
                  checked={diffAddr}
                  onChange={() => setDiffAddr(!diffAddr)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray300 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="toggle"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray300 cursor-pointer"
                ></label>
              </div>
              <label htmlFor="toggle" className="text-xs text-gray-700">
                {t("different_shipping_address")}
              </label>

              {diffAddr && (
                <div className="my-4">
                  <label htmlFor="shipping_address" className="text-lg">
                    {t("shipping_address")}
                  </label>
                  <textarea
                    id="shipping_address"
                    aria-label="shipping address"
                    className="w-full mt-1 mb-2 border-2 border-gray400 p-4 outline-none"
                    rows={4}
                    value={shippingAddress}
                    onChange={(e) =>
                      setShippingAddress(
                        (e.target as HTMLTextAreaElement).value
                      )
                    }
                  />
                </div>
              )}

              {!auth.user && (
                <div className="text-sm text-gray400 mt-8 leading-6">
                  {t("form_note")}
                </div>
              )}
            </div>
            <div className="h-full w-full lg:w-5/12 mt-10 lg:mt-4">
              {/* Cart Totals */}
              <div className="border border-gray500 p-6 divide-y-2 divide-gray200">
                <div className="flex justify-between">
                  <span className="text-base uppercase mb-3">
                    {t("product")}
                  </span>
                  <span className="text-base uppercase mb-3">
                    {t("subtotal")}
                  </span>
                </div>

                <div className="pt-2">
                  {cart.map((item) => (
                    <div className="flex justify-between mb-2" key={item.id}>
                      <span className="text-base font-medium">
                        {item.name}{" "}
                        <span className="text-gray400">x {item.qty}</span>
                      </span>
                      <span className="text-base">
                        {formatKes(item.price * item!.qty!)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="py-3 flex justify-between">
                  <span className="uppercase">{t("subtotal")}</span>
                  <span>{formatKes(+subtotal)}</span>
                </div>

                <div className="py-3">
                  <span className="uppercase">{t("delivery")}</span>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <input
                          type="radio"
                          name="deli"
                          value="STORE_PICKUP"
                          id="pickup"
                          checked={deli === "STORE_PICKUP"}
                          onChange={() => setDeli("STORE_PICKUP")}
                        />{" "}
                        <label htmlFor="pickup" className="cursor-pointer">
                          {t("store_pickup")}
                        </label>
                      </div>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <input
                          type="radio"
                          name="deli"
                          value="NAIROBI"
                          id="nairobi"
                          checked={deli === "NAIROBI"}
                          onChange={() => setDeli("NAIROBI")}
                          // defaultChecked
                        />{" "}
                        <label htmlFor="nairobi" className="cursor-pointer">
                          {t("within_nairobi")}
                        </label>
                      </div>
                      <span>{formatKes(siteConfig.delivery.nairobi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <input
                          type="radio"
                          name="deli"
                          value="OUTSIDE_NAIROBI"
                          id="others"
                          checked={deli === "OUTSIDE_NAIROBI"}
                          onChange={() => setDeli("OUTSIDE_NAIROBI")}
                        />{" "}
                        <label htmlFor="others" className="cursor-pointer">
                          {t("outside_nairobi")}
                        </label>
                      </div>
                      <span>{formatKes(siteConfig.delivery.outsideNairobi)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between py-3">
                    <span>{t("grand_total")}</span>
                    <span>{formatKes(+subtotal + deliFee)}</span>
                  </div>

                  <div className="grid gap-4 mt-2 mb-4">
                    <label
                      htmlFor="plan-cash"
                      className="relative flex flex-col bg-white p-5 rounded-lg shadow-md border border-gray300 cursor-pointer"
                    >
                      <span className="font-semibold text-gray-500 text-base leading-tight capitalize">
                        {t("cash_on_delivery")}
                      </span>
                      <input
                        type="radio"
                        name="plan"
                        id="plan-cash"
                        value="CASH_ON_DELIVERY"
                        className="absolute h-0 w-0 appearance-none"
                        onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                      />
                      <span
                        aria-hidden="true"
                        className={`${
                          paymentMethod === "CASH_ON_DELIVERY"
                            ? "block"
                            : "hidden"
                        } absolute inset-0 border-2 border-gray500 bg-opacity-10 rounded-lg`}
                      >
                        <span className="absolute top-4 right-4 h-6 w-6 inline-flex items-center justify-center rounded-full bg-gray100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5 text-green-600"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </span>
                    </label>
                    <label
                      htmlFor="plan-bank"
                      className="relative flex flex-col bg-white p-5 rounded-lg shadow-md border border-gray300 cursor-pointer"
                    >
                      <span className="font-semibold text-gray-500 leading-tight capitalize">
                        {t("mpesa")}
                      </span>
                      <span className="text-gray400 text-sm mt-1">
                        {t("mpesa_desc")}
                      </span>
                      <input
                        type="radio"
                        name="plan"
                        id="plan-bank"
                        value="MPESA"
                        className="absolute h-0 w-0 appearance-none"
                        onChange={() => setPaymentMethod("MPESA")}
                      />
                      <span
                        aria-hidden="true"
                        className={`${
                          paymentMethod === "MPESA" ? "block" : "hidden"
                        } absolute inset-0 border-2 border-gray500 bg-opacity-10 rounded-lg`}
                      >
                        <span className="absolute top-4 right-4 h-6 w-6 inline-flex items-center justify-center rounded-full bg-gray100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5 text-green-600"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </span>
                    </label>
                  </div>

                  <div className="my-8">
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input
                        type="checkbox"
                        name="send-email-toggle"
                        id="send-email-toggle"
                        checked={sendEmail}
                        onChange={() => setSendEmail(!sendEmail)}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray300 appearance-none cursor-pointer"
                      />
                      <label
                        htmlFor="send-email-toggle"
                        className="toggle-label block overflow-hidden h-6 rounded-full bg-gray300 cursor-pointer"
                      ></label>
                    </div>
                    <label
                      htmlFor="send-email-toggle"
                      className="text-xs text-gray-700"
                    >
                      {t("send_order_email")}
                    </label>
                  </div>
                </div>

                <Button
                  value={t("place_order")}
                  size="xl"
                  extraClass={`w-full`}
                  onClick={() => setIsOrdering(true)}
                  disabled={disableOrder}
                />
              </div>

              {orderError !== "" && (
                <span className="text-red text-sm font-semibold">
                  - {orderError}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="app-max-width px-4 sm:px-8 md:px-20 mb-14 mt-6">
            <div className="text-gray400 text-base">{t("thank_you_note")}</div>

            <div className="flex flex-col md:flex-row">
              <div className="h-full w-full md:w-1/2 mt-2 lg:mt-4">
                <div className="border border-gray500 p-6 divide-y-2 divide-gray200">
                  <div className="flex justify-between">
                    <span className="text-base uppercase mb-3">
                      {t("order_id")}
                    </span>
                    <span className="text-base uppercase mb-3">
                      {completedOrder.orderNumber}
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-base">{t("email_address")}</span>
                      <span className="text-base">{auth.user?.email}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-base">{t("order_date")}</span>
                      <span className="text-base">
                        {new Date(
                          completedOrder.orderDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-base">{t("delivery_date")}</span>
                      <span className="text-base">
                        {new Date(
                          completedOrder.deliveryDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="py-3">
                    <div className="flex justify-between mb-2">
                      <span className="">{t("payment_method")}</span>
                      <span>{completedOrder.paymentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">{t("delivery_method")}</span>
                      <span>{completedOrder.deliveryType}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between mb-2">
                    <span className="text-base uppercase">{t("total")}</span>
                    <span className="text-base">
                      {formatKes(completedOrder.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-full w-full md:w-1/2 md:ml-8 mt-4 md:mt-2 lg:mt-4">
                <div>
                  {t("your_order_received")}
                  {completedOrder.paymentType === "MPESA" && t("mpesa_note")}
                  {completedOrder.paymentType === "CASH_ON_DELIVERY" &&
                    completedOrder.deliveryType !== "STORE_PICKUP" &&
                    t("cash_delivery_note")}
                  {completedOrder.deliveryType === "STORE_PICKUP" &&
                    t("store_pickup_note")}
                  {t("thank_you_for_purchasing")}
                </div>

                {completedOrder.paymentType === "MPESA" ? (
                  <div className="mt-6">
                    <h2 className="text-xl font-bold">{t("mpesa")}</h2>
                    <p className="text-gray400">{t("mpesa_note")}</p>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-56">
                    <div className="w-3/4">
                      <Image
                        className="justify-center"
                        src="/STYLEALTRALOGO.png"
                        alt="StyleAltra"
                        width={220}
                        height={50}
                        layout="responsive"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== Footer Section ===== */}
      <Footer />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../messages/common/${locale}.json`)).default,
    },
  };
};

export default ShoppingCart;

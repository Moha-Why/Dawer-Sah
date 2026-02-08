"use client";

import { createContext, useContext, useState, useEffect } from "react";

const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const addToCart = async (product) => {
    let prod = product;
    const correctPrice = prod.newprice && prod.newprice > 0 ? prod.newprice : prod.price;

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === prod.id &&
          item.selectedColor === prod.selectedColor
      );

      if (existing) {
        return prev.map((item) =>
          item.id === prod.id &&
          item.selectedColor === prod.selectedColor
            ? { ...item, quantity: item.quantity + (prod.quantity || 1) }
            : item
        );
      } else {
        return [...prev, {
          ...prod,
          quantity: prod.quantity || 1,
          effectivePrice: correctPrice,
          originalPrice: prod.price,
          salePrice: prod.newprice || null
        }];
      }
    });
  };

  const removeFromCart = (id, selectedColor) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id &&
            item.selectedColor === selectedColor)
      )
    );
  };

  const decreaseQuantity = (id, selectedColor) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id &&
          item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce((total, item) => {
    const itemPrice = item.effectivePrice || item.newprice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  return (
    <MyContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        cartCount,
        cartTotal,
        clearCart,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);

export default MyContext;

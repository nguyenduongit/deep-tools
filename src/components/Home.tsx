import React from "react";

const Home = () => {
  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        height: "100%", // Đảm bảo component Home lấp đầy không gian
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Chào mừng đến với Trang chủ!</h1>
      <p>Nhập URL vào thanh địa chỉ ở trên để bắt đầu.</p>
    </div>
  );
};

export default Home;

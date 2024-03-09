export const Balance = ({ value }) => {
  return (
    <div className="flex">
      <div className="font-bold text-lg"></div>
      Your balance
      <div className="font-semibold ml-4 text-lg">Rs {value}</div>
    </div>
  );
};

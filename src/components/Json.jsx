import React, { useEffect, useState } from "react";
import "./Main.css"

const Json = ({ setUnit }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const api = await fetch(
        "https://api-staging.inveesync.in/test/get-items"
      );
      const returned = await api.json();
      setData(returned);
    };
    fetchData();
  }, []);


// Dynamically Updating input as user selects an item
  const handleItemChange = (e) => {
    const selectedItem = data.find(item => item.item_name === e.target.value);
    if (selectedItem) {
      setUnit(selectedItem.unit);
    } else {
        setUnit('');
    }
  };

  return (
    <div>
      <select className="input" name="items" id="select_options" onChange={handleItemChange}>
        <option >Select</option>
        {data.map((elem) => (
          <option key={elem.id} value={elem.item_name}>{elem.item_name}</option>
        ))}
      </select>
    </div>
  );
};

export default Json;

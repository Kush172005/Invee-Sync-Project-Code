import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-toastify";
import "./Main.css";

const Main = () => {
  const [scan, setScan] = useState(false);
  const [destination, setDestination] = useState("");
  const [unit, setUnit] = useState("");
  const [qty, setQty] = useState(0);
  const [data, setData] = useState([]);
  const [validlocation, setValidlocation] = useState([]);
  const [hidemain, setHidemain] = useState(true);

  const onScanSuccess = (decodedText) => {
    if (decodedText) {
      setHidemain(true);
      setDestination(decodedText);
      setScan(false);
    }
  };

  const onScanFailure = (err) => {
    console.error(err);
  };

  const handleInputClick = () => {
    setScan(true);
    setHidemain(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api-staging.inveesync.in/test/get-items"
        );
        const items = await response.json();
        setData(items);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (e) => {
    const selectedItem = data.find((item) => item.item_name === e.target.value);
    if (selectedItem) {
      setUnit(selectedItem.unit);
      setValidlocation(selectedItem.allowed_locations);
    } else {
      setUnit("");
      setValidlocation("");
    }
  };

  useEffect(() => {
    if (scan) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);

      return () => {
        scanner.clear();
      };
    }
  }, [scan]);

  const toNewLocation = async () => {
    try {
      const requestBody = [
        {
          id: data.find((item) => item.item_name === destination)?.id,
          item_name: data.find((item) => item.item_name === destination)
            ?.item_name,
          location: destination,
        },
      ];

      const response = await fetch(
        "https://api-staging.inveesync.in/test/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        console.log(response.code);
        toast.success("Success");
      } else {
        console.error(response.code);
      }
    } catch (error) {
      console.error("Error submitting item:", error);
    }
  };

  const checkSubmit = async (e) => {
    e.preventDefault();
    if (validlocation.includes(destination)) {
      await toNewLocation();
    } else {
      toast.error("Error Try Again");
    }
  };

  function numberToWords(num) {
    if (num === 0) return "Zero";

    const belowTwenty = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const thousands = ["", "Thousand", "Million", "Billion"];

    const helper = (n) => {
      if (n === 0) return "";
      else if (n < 20) return belowTwenty[n] + " ";
      else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
      else
        return belowTwenty[Math.floor(n / 100)] + " Hundred " + helper(n % 100);
    };

    let result = "";
    let i = 0;

    while (num > 0) {
      if (num % 1000 !== 0) {
        result = helper(num % 1000) + thousands[i] + " " + result;
      }
      num = Math.floor(num / 1000);
      i++;
    }

    return result.trim();
  }

  return (
    <div>
      <form onSubmit={checkSubmit}>
        <div className="main">
          {hidemain && (
            <>
              <div className="selection">
                <div className="selection1 selection_common">
                  <div>Select an item</div>
                  <select
                    className="input"
                    name="items"
                    id="select_options"
                    onChange={handleItemChange}
                  >
                    <option value="">Select</option>
                    {data.map((elem) => (
                      <option key={elem.id} value={elem.item_name}>
                        {elem.item_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="QtyUnit">
                  <div className="selection2 selection_common">
                    <div>Quantity</div>
                    <input
                      onChange={(e) =>
                        setQty(e.target.value >= 0 ? e.target.value : 0)
                      }
                      value={qty}
                      className="input"
                      type="number"
                    />
                  </div>

                  <div className="selection3 selection_common">
                    <div>Unit</div>
                    <input
                      className="input"
                      value={unit}
                      type="text"
                      readOnly
                    />
                  </div>
                </div>
                <div> Ouantity in words: {numberToWords(qty)}</div>
              </div>

              <div className="destination">
                <div>Destination Location</div>
                <input
                  placeholder="Destination . . ."
                  type="text"
                  value={destination}
                  onClick={handleInputClick}
                  readOnly
                />
              </div>
            </>
          )}

          {scan && (
            <div className="qr-reader">
              <div id="reader"></div>
            </div>
          )}

          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default Main;

const API_URL =
  "https://script.google.com/macros/s/AKfycbzHSlcGVg7EUUJdKf6PoPA0UhJCgbnd78lgy7bYRdGAzYplX7Pj8v8-fA2l4JFWxyGQ/exec";


/* =========================
   ELEMENTS
========================= */

const form =
  document.getElementById("customerForm");

const recordsContainer =
  document.getElementById("recordsContainer");

const customerCount =
  document.getElementById("customerCount");

const searchInput =
  document.getElementById("searchInput");

const refreshBtn =
  document.getElementById("refreshBtn");

const resultBox =
  document.getElementById("result");


/* =========================
   DATA
========================= */

let allCustomers = [];


/* =========================
   LOAD CUSTOMERS
========================= */

async function loadCustomers() {

  if (recordsContainer) {

    recordsContainer.innerHTML =
      '<div class="loading">Loading customers...</div>';

  }


  try {

    const response =
      await fetch(API_URL, {

        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify({
          action: "getCustomers"
        })

      });


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.error ||
        "Failed to load customers"
      );

    }


    allCustomers =
      Array.isArray(result.customers)
        ? result.customers
        : [];


    renderCustomers(
      allCustomers
    );


  } catch (error) {

    console.error(
      "Load error:",
      error
    );


    if (recordsContainer) {

      recordsContainer.innerHTML = `

        <div class="error">

          Failed to load customers.

          <br>

          <small>
            ${escapeHTML(
              error.message
            )}
          </small>

        </div>

      `;

    }


    updateCustomerCount(0);

  }

}


/* =========================
   RENDER CUSTOMERS
========================= */

function renderCustomers(
  customers
) {

  if (!recordsContainer) {
    return;
  }


  updateCustomerCount(
    customers.length
  );


  if (!customers.length) {

    recordsContainer.innerHTML =
      '<div class="empty">No customer records found.</div>';

    return;

  }


  let html = `

    <div class="tableWrapper">

      <table class="customerTable">

        <thead>

          <tr>

            <th>Ref Code</th>

            <th>Customer</th>

            <th>Phone</th>

            <th>Place</th>

            <th>Item</th>

            <th>Qty</th>

            <th>Received</th>

            <th>Delivery</th>

            <th>Total</th>

            <th>Balance</th>

            <th>Status</th>

            <th>WhatsApp</th>

          </tr>

        </thead>

        <tbody>

  `;


  customers.forEach(
    (customer, index) => {

      const status =
        customer.stitchingStatus ||
        "Received";


      html += `

        <tr>

          <td>
            <strong class="referenceCode">
              ${escapeHTML(
                customer.referenceId || ""
              )}
            </strong>
          </td>


          <td>
            ${escapeHTML(
              customer.customerName || ""
            )}
          </td>


          <td>
            ${escapeHTML(
              customer.phone || ""
            )}
          </td>


          <td>
            ${escapeHTML(
              customer.place || ""
            )}
          </td>


          <td>
            ${escapeHTML(
              customer.itemType || ""
            )}
          </td>


          <td>
            ${escapeHTML(
              customer.quantity || ""
            )}
          </td>


          <td>
            ${formatDate(
              customer.receivedDate
            )}
          </td>


          <td>
            ${formatDate(
              customer.deliveryDate
            )}
          </td>


          <td>
            ${formatMoney(
              customer.totalAmount
            )}
          </td>


          <td>
            <strong>
              ${formatMoney(
                customer.balance
              )}
            </strong>
          </td>


          <td>

            <span
              class="status ${statusClass(status)}"
            >
              ${escapeHTML(status)}
            </span>

          </td>


          <td>

            <button
              class="whatsappBtn"
              type="button"
              data-customer-index="${index}"
            >
              WhatsApp
            </button>

          </td>

        </tr>

      `;

    }
  );


  html += `

        </tbody>

      </table>

    </div>

  `;


  recordsContainer.innerHTML =
    html;


  /*
    Add WhatsApp click events
  */

  const buttons =
    recordsContainer.querySelectorAll(
      ".whatsappBtn"
    );


  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        function () {

          const index =
            Number(
              button.dataset.customerIndex
            );


          const customer =
            customers[index];


          if (customer) {

            sendWhatsApp(
              customer
            );

          }

        }
      );

    }
  );

}


/* =========================
   SAVE CUSTOMER
========================= */

if (form) {

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const submitButton =
        form.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.textContent =
          "Saving...";

      }


      try {

        const formData =
          new FormData(form);


        const data = {

          action:
            "saveCustomer",

          customerName:
            formData.get(
              "customerName"
            ) || "",

          phone:
            formData.get(
              "phone"
            ) || "",

          place:
            formData.get(
              "place"
            ) || "",

          receivedDate:
            formData.get(
              "receivedDate"
            ) || "",

          deliveryDate:
            formData.get(
              "deliveryDate"
            ) || "",

          itemType:
            formData.get(
              "itemType"
            ) || "",

          quantity:
            formData.get(
              "quantity"
            ) || "",

          measurements:
            formData.get(
              "measurements"
            ) || "",

          specialNotes:
            formData.get(
              "specialNotes"
            ) || "",

          stitchingStatus:
            formData.get(
              "stitchingStatus"
            ) || "Received",

          totalAmount:
            formData.get(
              "totalAmount"
            ) || 0,

          advance:
            formData.get(
              "advance"
            ) || 0

        };


        const response =
          await fetch(API_URL, {

            method: "POST",

            headers: {
              "Content-Type":
                "text/plain;charset=utf-8"
            },

            body:
              JSON.stringify(data)

          });


        const result =
          await response.json();


        if (!result.success) {

          throw new Error(
            result.error ||
            "Failed to save customer"
          );

        }


        if (resultBox) {

          resultBox.innerHTML = `

            <div class="success">

              Customer saved successfully!

              <br>

              <strong>
                Reference Code:
                ${escapeHTML(
                  result.referenceId || ""
                )}
              </strong>

            </div>

          `;

        } else {

          alert(
            "Customer saved successfully!\n\n" +
            "Reference Code: " +
            result.referenceId
          );

        }


        form.reset();


        const quantityInput =
          document.getElementById(
            "quantity"
          );


        if (quantityInput) {

          quantityInput.value =
            "1";

        }


        await loadCustomers();


      } catch (error) {

        console.error(
          "Save error:",
          error
        );


        if (resultBox) {

          resultBox.innerHTML = `

            <div class="error">

              Failed to save customer.

              <br>

              <small>
                ${escapeHTML(
                  error.message
                )}
              </small>

            </div>

          `;

        } else {

          alert(
            "Failed to save customer.\n\n" +
            error.message
          );

        }


      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            "Save Customer";

        }

      }

    }
  );

}


/* =========================
   WHATSAPP
========================= */

function sendWhatsApp(
  customer
) {

  let phone =
    String(
      customer.phone || ""
    )
    .replace(
      /\D/g,
      ""
    );


  /*
    Automatically add India
    country code for 10 digit
    Indian mobile numbers.
  */

  if (
    phone.length === 10 &&
    /^[6-9]/.test(phone)
  ) {

    phone =
      "91" + phone;

  }


  if (!phone) {

    alert(
      "Customer phone number not available."
    );

    return;

  }


  const message =
`Hi ${customer.customerName || ""},

*എടക്കര ബറക്കാത്തിൽ നിന്നും*

നിങ്ങളുടെ ${customer.itemType || ""} സ്റ്റിച്ച് ചെയ്തു വച്ചിട്ടുണ്ട്.

Reference Code: ${customer.referenceId || ""}

Thank you 😊,
EDAKKARA BARAKATH`;


  const whatsappURL =
    "https://wa.me/" +
    phone +
    "?text=" +
    encodeURIComponent(
      message
    );


  window.open(
    whatsappURL,
    "_blank"
  );

}


/* =========================
   SEARCH
========================= */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    function () {

      const searchTerm =
        searchInput.value
          .trim()
          .toLowerCase();


      if (!searchTerm) {

        renderCustomers(
          allCustomers
        );

        return;

      }


      const filteredCustomers =
        allCustomers.filter(
          customer => {

            const searchableText = [

              customer.referenceId,

              customer.customerName,

              customer.phone,

              customer.place,

              customer.itemType,

              customer.quantity,

              customer.stitchingStatus

            ]
              .join(" ")
              .toLowerCase();


            return searchableText.includes(
              searchTerm
            );

          }
        );


      renderCustomers(
        filteredCustomers
      );

    }
  );

}


/* =========================
   REFRESH
========================= */

if (refreshBtn) {

  refreshBtn.addEventListener(
    "click",
    function () {

      loadCustomers();

    }
  );

}


/* =========================
   CUSTOMER COUNT
========================= */

function updateCustomerCount(
  count
) {

  if (!customerCount) {
    return;
  }


  customerCount.textContent =
    `${count} customer${
      count === 1
        ? ""
        : "s"
    }`;

}


/* =========================
   MONEY
========================= */

function formatMoney(
  value
) {

  const number =
    Number(
      value || 0
    );


  return (
    "₹" +
    number.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    )
  );

}


/* =========================
   DATE
========================= */

function formatDate(
  value
) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(value);


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return escapeHTML(
      String(value)
    );

  }


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


/* =========================
   STATUS CLASS
========================= */

function statusClass(
  status
) {

  const value =
    String(
      status || ""
    )
    .toLowerCase()
    .trim();


  if (
    value.includes("complete") ||
    value.includes("ready") ||
    value.includes("delivered")
  ) {

    return "statusComplete";

  }


  if (
    value.includes("progress") ||
    value.includes("stitch")
  ) {

    return "statusProgress";

  }


  if (
    value.includes("pending") ||
    value.includes("received")
  ) {

    return "statusPending";

  }


  return "statusDefault";

}


/* =========================
   HTML ESCAPE
========================= */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadCustomers();

  }
);
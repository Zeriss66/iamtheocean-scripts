(function () {
  const BASE_URL = "https://nfc.iamtheocean.com";
  const SECRET = "rJ17Oe6sK602YZNEOUex1N7ApTNEDStz";

  /** ---------------- HELPERS ---------------- */

  const getParam = (key) => {
    return new URLSearchParams(window.location.search).get(key);
  };

  const getEl = (id) => document.getElementById(id);

  const setText = (id, value) => {
    const el = getEl(id);
    if (el) el.textContent = value || "—";
  };

  const setHTML = (id, value) => {
    const el = getEl(id);
    if (el) el.innerHTML = value || "";
  };

  const setImg = (id, src) => {
    const el = getEl(id);
    if (el && src) {
      el.src = src;
      el.setAttribute("src", src);
      el.removeAttribute("srcset");
    }
  };

  function redirectTo(url) {
    const path = window.location.pathname;

    if (
      path.includes("/nfc/error") ||
      path.includes("/nfc/product-not-authentic")
    ) {
      return;
    }

    // Avoid redirect loop
    if (window.location.href.includes(url)) return;
    window.location.href = url;
  }

  const buildUrl = (path) => {
    if (!path) return "";
    return path.startsWith("/") ? BASE_URL + path : BASE_URL + "/" + path;
  };

  /** ---------------- UTILS ---------------- */
  function formatDateUS(isoString) {
    const date = new Date(isoString);

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  function buildChildrenParagraphs(itemsData = []) {
    if (!Array.isArray(itemsData)) return "";

    return itemsData
      .map((item) => {
        const type = item.childType || "—";
        const serial = item.serialNumber || "—";
        return `<p>${type}:</p> <p>${serial}</p>`;
      })
      .join("");
  }

  function extractParagraphs(jsonString) {
    const data = JSON.parse(jsonString);

    const values = [];

    function paragraph(node) {
      if (!node) return;

      if (node.value) {
        values.push(node.value);
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child) => paragraph(child));
      }
    }

    paragraph(data);

    return values.map((v) => `<p>${v}</p>`).join("");
  }

  /** ---------------- ADAPTER ---------------- */

  function adapt(data) {
    // Verify token validation
    if (data.validationStatus !== "OK") {
      redirectTo("https://iamtheocean.com/nfc/product-not-authentic");
      return null;
    }

    if (!data || !data.product) {
      console.error("Invalid data format:", data);
      redirectTo("https://iamtheocean.com/nfc/error");
      return null;
    }

    const {
      product,
      item = {},
      collection = [],
      productData = {},
      itemsData = [],
      tagUid,
    } = data;
    const ap = product.additionalParameters || {};
    const images = product?.image || [];

    //Find image of entire product
    const mainCardSKU = productData?.code;
    const imageProductLocation =
      images.find((image) => image?.name?.includes(mainCardSKU))?.location ||
      images[0]?.location ||
      "";
    const firstImage = `${BASE_URL}${imageProductLocation}` || "";

    //Glow image
    const childSKU = ap?.skuNumber;
    let glowImage;
    //check if user tap a child tag
    if (mainCardSKU !== childSKU) {
      const imageChildLocation =
        images.find((image) => image?.name?.includes(childSKU))?.location || "";
      glowImage = `${BASE_URL}${imageChildLocation}`;
    }

    const color = product?.color;
    const details = extractParagraphs(
      productData?.additionalParameters?.product_metafields?.[
        "custom.composition"
      ] || "{}"
    );
    const description = [
      product.line,
      [product.size, product.color, product.variant]
        .filter(Boolean)
        .join(" · "),
      ap.nfcChipType && `NFC: ${ap.nfcChipType}`,
    ].filter(Boolean);
    const description2 = productData?.longDescription ?? "";

    const related = [];

    collection.forEach((c) => {
      (c.productCodes || []).forEach((code) => {
        if (code !== product.productCode) {
          related.push({
            name: code,
            imagePath: images[1]?.url || "",
          });
        }
      });
    });

    return {
      name: productData.description,
      serial: buildChildrenParagraphs(
        itemsData.filter((i) => i.serialNumber != tagUid)
      ),
      date: formatDateUS(item.createdAt || product.createdAt),
      color,
      details,
      description,
      description2,
      image: firstImage,
      glowImage,
      related,
    };
  }

  /** ---------------- UI ---------------- */

  function render(data) {
    setText("nft-name", data.name);
    setText("nft-main-name", data.name);
    setText("nft-color-code", data.color);
    setHTML("nft-serial-code", data.serial);
    setHTML("nft-details", data.details);
    //setText("nft-country-of-origin", non so cosa ci va);

    setText("nft-description", data.description[0]);
    setHTML("nft-description-2", data.description2);

    // IMMAGINE FUORI DALLA MODALE
    setImg("nft-purse-image", data.image);
    // IMMAGINE PRINCIPALE NELLA MODALE
    setImg("nft-purse-image-2", data.image);
    // IMMAGINE GLOW
    !!data?.glowImage && setImg("nft-purse-glow", data?.glowImage);

    const container = getEl("nft-related-purse-container");
    const template = getEl("nft-related-purse");

    if (container && template) {
      template.style.display = "none";

      data.related.forEach((item) => {
        const clone = template.cloneNode(true);

        const nameEl = clone.querySelector("#nft-related-purse-name");
        const imgEl = clone.querySelector("#nft-related-purse-img");

        if (nameEl) nameEl.textContent = item.name;
        if (imgEl) imgEl.src = item.imagePath;

        container.appendChild(clone);
      });
    }
  }

  /** ---------------- MAIN ---------------- */

  async function init() {
    const jwt = getParam("jwt");

    if (!jwt) {
      redirectTo("https://iamtheocean.com/nfc/error");
      return;
    }

    try {
      const res = await fetch(BASE_URL + "/cs/verifytoken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          secret: SECRET,
        },
        body: JSON.stringify({ jwt }),
      });

      const json = await res.json();
      const adapted = adapt(json);

      render(adapted);
    } catch (err) {
      console.error("ERROR:", err);
      redirectTo("https://iamtheocean.com/nfc/error");
    }
  }

  // ensures Webflow DOM is ready
  window.addEventListener("load", init);
})();

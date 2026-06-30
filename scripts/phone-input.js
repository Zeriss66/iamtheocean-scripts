var input = document.querySelector("#phone"),
  dialCode = document.querySelector(".dialCode"),
  errorMsg = document.querySelector("#error-msg"),
  validMsg = document.querySelector("#valid-msg");

var iti = intlTelInput(input, {
  initialCountry: "us",
  placeholderNumberType: "FIXED_LINE",
});

var updateInputValue = function (event) {
  dialCode.value = "+" + iti.getSelectedCountryData().dialCode;
};
input.addEventListener("input", updateInputValue, false);
input.addEventListener("countrychange", updateInputValue, false);

var errorMap = [
  "Invalid number",
  "Invalid country code",
  "Too short",
  "Too long",
  "Invalid number",
];

var reset = function () {
  input.classList.remove("error");
  errorMsg.innerHTML = "";
  errorMsg.classList.add("hide");
  validMsg.classList.add("hide");
};

input.addEventListener("blur", function () {
  reset();
  if (input.value.trim()) {
    if (iti.isValidNumber()) {
      validMsg.classList.remove("hide");
    } else {
      input.classList.add("error");
      var errorCode = iti.getValidationError();
      errorMsg.innerHTML = errorMap[errorCode];
      errorMsg.classList.remove("hide");
    }
  }
});

input.addEventListener("change", reset);
input.addEventListener("keyup", reset);

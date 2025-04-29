const Profile = require("../models/adminProfileModel");
const Form = require("../models/registerModel.js");

exports.sendPaymentDetails = async (req, res) => {
  try {
    const { customerId, schemeAmount } = req.body;

    if (!customerId || !schemeAmount) {
      return res
        .status(400)
        .json({ message: "customerId and schemeAmount are required" });
    }

    const percentages = [4, 5, 6];
    const foundProfiles = [];

    let currentId = customerId;

    console.log("Starting customerId:", currentId);

    while (currentId.length > 3 && foundProfiles.length < 3) {
      currentId = removeLastBlock(currentId); // 🛠 First remove 1 block

      if (currentId === "EMP") {
        console.log("Reached EMP, stopping.");
        break;
      }

      const profile = await Profile.findOne({ customerId: currentId });

      if (profile) {
        console.log(
          `Found profile at level ${foundProfiles.length + 1}:`,
          profile.customerId
        );
        foundProfiles.push(profile);
      } else {
        console.log(`No profile found for customerId: ${currentId}`);
      }
    }

    // Update found profiles
    for (let i = 0; i < foundProfiles.length; i++) {
      const percent = percentages[i];
      const amount = (schemeAmount * percent) / 100;

      const id = foundProfiles[i].customerId;

      console.log(`Updating profile ${id} with amount ${amount}`);

      await Profile.updateOne(
        { customerId: id },
        {
          $push: {
            paymentDetails: {
              customerId: customerId,
              amount: amount,
            },
          },
        }
      );
    }

    // Save 85% to Form model
    // Save 85% to Form model
    const baseCode = customerId.substring(0, 3); // First 3 letters
    const customerInForm = await Form.findOne({ shareId: baseCode });

    if (!customerInForm) {
      console.log(
        "Customer not found in Form collection for shareId:",
        baseCode
      );
      return res
        .status(404)
        .json({ message: "Customer not found in Form collection" });
    }

    const amount85 = (schemeAmount * 85) / 100;

    console.log(`Saving 85% (${amount85}) to Form for shareId: ${baseCode}`);

    await Form.updateOne(
      { shareId: baseCode },
      {
        $push: {
          paymentDetails: {
            customerId: customerId,
            amount: amount85,
          },
        },
      }
    );
    res.status(200).json({ message: "Payment processed successfully!" });
  } catch (error) {
    console.error("Error in sendPaymentDetails:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

function removeLastBlock(id) {
  if (id.length <= 3) return id; // base EMP case

  let tempId = id;
  let i = tempId.length - 1;

  // Remove letter
  if (/[A-Za-z]/.test(tempId[i])) {
    tempId = tempId.slice(0, -1);
    i--;
  } else {
    return tempId;
  }

  // Remove number(s) - allow multiple digits
  while (i >= 0 && /\d/.test(tempId[i])) {
    tempId = tempId.slice(0, -1);
    i--;
  }

  return tempId;
}

exports.sendCusPaymentDetails = async (req, res) => {
  try {
    const { customerId, schemeAmount } = req.body;

    if (!customerId || !schemeAmount) {
      return res
        .status(400)
        .json({ message: "customerId and schemeAmount are required" });
    }

    // Take only the first 3 letters (like "EMP")
    const baseCode = customerId.substring(0, 3);

    const customerInForm = await Form.findOne({ shareId: baseCode });

    if (!customerInForm) {
      console.log(
        "Customer not found in Form collection for shareId:",
        baseCode
      );
      return res
        .status(404)
        .json({ message: "Customer not found in Form collection" });
    }

    console.log(
      `Saving 100% (${schemeAmount}) to Form for shareId: ${baseCode}`
    );

    await Form.updateOne(
      { shareId: baseCode },
      {
        $push: {
          paymentDetails: {
            customerId: customerId,
            amount: schemeAmount, // 100% full amount
          },
        },
      }
    );

    res
      .status(200)
      .json({ message: "Customer payment processed successfully!" });
  } catch (error) {
    console.error("Error in sendCusPaymentDetails:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

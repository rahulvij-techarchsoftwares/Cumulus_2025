import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import axios from "axios";
import { Link as ScrollLink } from "react-scroll";
import tic from "../landing/Assets/tick.png";
import { API_URL } from "../utils/Apiconfig";
import { Link, useNavigate } from "react-router-dom";
import {loadStripe} from '@stripe/stripe-js';
import fetchUserData from "./fetchUserData";
import Alert from "../utils/Alerts";
function SubscriptionCard({ data }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
    const [alert, setAlert] = useState(null);
  const [billingCycle, setBillingCycle] = useState("");
  const [planid, setPlanid] = useState(null);
    const [planName, setPlanName] = useState("");
  const [planType, setPlanType] = useState("");
  const [planPrice, setPlanPrice] = useState("");
    const [plan, setPlan] = useState("");
    const showAlert = (variant, title, message) => {
      setAlert({ variant, title, message });
    
      // Automatically remove alert after 5 seconds
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    };
  const getUserData = async () => {
    try {
        const data = await fetchUserData();
        console.log("Fetched user data:", data);

        if (!data?.user) {
            console.error("Invalid user data structure");
            return;
        }

        // ✅ Log membership details
        // console.log("User memberships:", data.user.memberships);

        // Extract latest membership details
        if (Array.isArray(data.user.memberships) && data.user.memberships.length > 0) {
            const latestMembership = data.user.memberships[data.user.memberships.length - 1];
            // console.log("Latest Membership:", latestMembership);

            const subscription = latestMembership?.subscription_id;
            if (subscription) {
                const planType = latestMembership.planTime;
                let planPrice = "N/A";

                if (planType === "monthly" && subscription.cost?.monthly) {
                    planPrice = `$${subscription.cost.monthly}`;
                } else if (planType === "yearly" && subscription.cost?.yearly) {
                    planPrice = `$${subscription.cost.yearly}`;
                } else if (subscription.cost?.custom_pricing) {
                    planPrice = "Custom Pricing";
                }

                // console.log("Subscription Plan:", subscription.subscription_name);
                // console.log("Plan Type:", planType);
                // console.log("Plan Price:", planPrice);

                setPlan(subscription.subscription_name);
                setPlanType(planType);
                setPlanPrice(planPrice);
            }
        } else {
            // console.warn("No membership found.");
        }

        // ✅ Log Google Drive connection
        const googleDrive = data.user.googleDrive?.[0];
        // console.log("Google Drive Data:", googleDrive);

 

    } catch (err) {
        console.error("Error fetching user data:", err.message || err);
    }
};


  useEffect(() => {
    getUserData();
  }, []);



  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling when popup is closed
    }

    return () => {
      document.body.style.overflow = "auto"; // Ensure scrolling is reset when unmounting
    };
  }, [showPopup]);


  const handleUpgradePlan = async (planName, billingCycle,subscriptionId) => {
    // console.log("📤 Sending request with:", { planType: planName, duration: billingCycle, subscriptionId });


    const email = localStorage.getItem("email");

   const userId = localStorage.getItem("userId");
  //  const stripe = await loadStripe('pk_live_51QygE8J7Fy59EZyjsleXQrZGvGmFDKY8lv7p5uIV0Onrc11eQLMzj1Rwi8YewBVrdRFiMv7W3PSMNwZrIHXLY3zN00xFl5VsPo');
const stripe = await loadStripe('pk_live_51R46tUJtGMRxDbeFDRN2sRTMOZ9inmw7Nc6SlUaBHPaSdHn94Fo7bXGAHJqWGJAmsk9fU0hVe6fspjBMjazfWxf400VKYCo0fV'); 
//  const stripe = await loadStripe('pk_test_51QygE8J7Fy59EZyjD32cUYRILHglbcefxO4E2wpYTtV9N5RkkTVw1S2SpTSci5DOdFtzq0TIKQ4J8MCli2qZQqyA00WchFE1Ml');
    if (!planName || !billingCycle) {
      // console.error("❌ Missing required parameters: planType or duration");
      return;
    }
  
    const body = {
      planType: planName, // Pass name instead of ID
      duration: billingCycle, // Send 'monthly' or 'yearly'
      user_id: userId,
      subscription_id: subscriptionId || "",
      email:email
    };
  
    try {
      // console.log("📤 Body being sent to API:", body);
      const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      if (response.ok) {
        const session = await response.json();
        // console.log("🎉 Session created:", session);
  
        if (session.id) {
          await stripe.redirectToCheckout({ sessionId: session.id });
        } else {
          // console.error("❌ Stripe session creation failed:", session.error || "Unknown error");
          showAlert("error", "Error", session.error || "Stripe session creation failed");
        }
      } else {
        // console.error("❌ Failed to create checkout session. Status:", response.status);
        showAlert("error", "Error", "❌ Failed to create checkout session. Status:", response.status);
        const error = await response.json();
        // console.error("❌ Error details:", error);
        showAlert("error", "Error", error);
      }
    } catch (error) {
      // console.error("❌ Error during checkout session creation", error);
      showAlert("error", "Error", error);
    }
  };
  
  
  
  

  const handlePlanClick = (e) => {
    const clickedId = e.currentTarget.id;

    if (clickedId.includes("foundation") || clickedId.includes("legacy")) {
      setSelectedPlan(data);
      console.log("Selected Plan:", data);
      console.log("selectedplan",selectedPlan)
      setShowPopup(true);
    } else if (clickedId.includes("heritage")) {
      navigate("/", { state: { scrollTo: "assistance" } });
    }
  };


  
  const handleConfirmSubscription = () => {
    if (!selectedPlan) {
      console.error("❌ No selected plan found!");
      return;
    }
    
    console.log("✅ Selected Plan:", selectedPlan); // Debugging log
  
    let planName = null;
  
    if (selectedPlan.subscription_name.includes("Legacy")) {
      planName = "legacyPremium";
    } else if (selectedPlan.subscription_name.includes("Foundation")) {
      planName = "foundationStandard";
    }
  
    if (planName && selectedPlan._id) {
      console.log("📤 Sending subscription ID:", selectedPlan._id); // Debugging log
      handleUpgradePlan(planName, billingCycle, selectedPlan._id);
    } else {
      console.error("❌ Missing price ID or subscription ID!");
    }
  
    setShowPopup(false);
  };
  
  
  
  // Use useEffect to ensure handleUpgradePlan is called after state updates
  useEffect(() => {
    if (planid && selectedPlan) {
      handleUpgradePlan(planid, selectedPlan.subscription_name ,selectedPlan._id);
    }
  }, [planid]); // Runs whenever planid changes
  

  return (

  <>

    <div className="bg-white shadow-lg rounded-lg p-4 border-2">
      <h2 className="text-xl font-semibold mb-4">{data.subscription_name}</h2>
      <p className="text-2xl font-bold mb-4">
        {data.price === "Custom Pricing" ? data.price : `$${data.price}`}
        {data.period && <span className="text-sm"> {data.period}</span>}
      </p>

      <div className="plan">
        <button
          id={`btn-${data.subscription_name.replace(/\s+/g, '').toLowerCase()}`}
          className="w-full bg-blue-500 text-white py-2 rounded-lg mb-4"
          onClick={handlePlanClick}
        >
          {data.buttonLabel}
        </button>
      </div>

      <ul className="space-y-2">
        {data.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            ✅ {feature}
          </li>
        ))}
      </ul>

      {showPopup && selectedPlan && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Choose Billing Cycle</h3>
      <div className="flex flex-col space-y-2">
        {/* Show Monthly Option only if the user does NOT have a Foundation (Standard) or Legacy (Premium) monthly plan */}
        {!(
          (selectedPlan.subscription_name === "Foundation (Standard)" && plan === "Foundation (Standard)" && planType === "monthly") ||
          (selectedPlan.subscription_name === "Legacy (Premium)" && plan === "Legacy (Premium)" && planType === "monthly")
        ) && (
          <label className="flex items-center">
            <input
              type="radio"
              name="billingCycle"
              value="monthly"
              checked={billingCycle === "monthly"}
              onChange={() => setBillingCycle("monthly")}
            />
            <span className="ml-2">Monthly</span>
          </label>
        )}

        {/* Always show Yearly option */}
        <label className="flex items-center">
          <input
            type="radio"
            name="billingCycle"
            value="yearly"
            checked={billingCycle === "yearly"}
            onChange={() => setBillingCycle("yearly")}
          />
          <span className="ml-2">Yearly</span>
        </label>
      </div>

      <div className="flex justify-end mt-4">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          onClick={() => setShowPopup(false)}
        >
          Cancel
        </button>
        <button
          className={`px-4 py-2 rounded ${
            billingCycle ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
          onClick={handleConfirmSubscription}
          disabled={!billingCycle} // Disable button if no billing cycle is selected
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}

{alert && <Alert {...alert} />}
    </div>
    </>

    
    
  );
}


function Subscription() {
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planType, setPlanType] = useState("");
  const [planPrice, setPlanPrice] = useState("");
    const [plan, setPlan] = useState("");

  const getUserData = async () => {
    try {
        const data = await fetchUserData();
        console.log("Fetched user data:", data);

        if (!data?.user) {
            console.error("Invalid user data structure");
            return;
        }

        // ✅ Log membership details
        console.log("User memberships:", data.user.memberships);

        // Extract latest membership details
        if (Array.isArray(data.user.memberships) && data.user.memberships.length > 0) {
            const latestMembership = data.user.memberships[data.user.memberships.length - 1];
            console.log("Latest Membership:", latestMembership);

            const subscription = latestMembership?.subscription_id;
            if (subscription) {
                const planType = latestMembership.planTime;
                let planPrice = "N/A";

                if (planType === "monthly" && subscription.cost?.monthly) {
                    planPrice = `$${subscription.cost.monthly}`;
                } else if (planType === "yearly" && subscription.cost?.yearly) {
                    planPrice = `$${subscription.cost.yearly}`;
                } else if (subscription.cost?.custom_pricing) {
                    planPrice = "Custom Pricing";
                }

                console.log("Subscription Plan:", subscription.subscription_name);
                console.log("Plan Type:", planType);
                console.log("Plan Price:", planPrice);

                setPlan(subscription.subscription_name);
                setPlanType(planType);
                setPlanPrice(planPrice);
            }
        } else {
            console.warn("No membership found.");
        }

        // ✅ Log Google Drive connection
        const googleDrive = data.user.googleDrive?.[0];
        console.log("Google Drive Data:", googleDrive);

 

    } catch (err) {
        console.error("Error fetching user data:", err.message || err);
    }
};

useEffect(() => {
  console.log("Selected Plan:", plan);
  console.log("Selected Plan Type:", planType);
}, [plan, planType]);

  useEffect(() => {
    getUserData();
  }, []);


  const response = [
    {
      cost: {
        monthly: "4.99",
        yearly: "49",
        custom_pricing: false,
      },
      features: {
        storage: "10 GB",
        encryption: "Advanced Encryption",
        document_sharing: "Standard",
        inheritance_features: "Basic Inheritance",
        integrations: ["Google Drive"],
        automatic_photo_upload: false,
        support: "Standard Support",
        extra_features: [],
      },
      _id: "6749711c3d3e25604853e8a5",
      subscription_name: "Foundation (Standard)",
      created_at: "2024-11-29T07:45:32.196Z",
      __v: 0,
    },
    {
      cost: {
        monthly: "9.99",
        yearly: "99",
        custom_pricing: false,
      },
      features: {
        storage: "20 GB",
        encryption: "Enhanced Encryption",
        document_sharing: "Advanced Sharing Controls",
        inheritance_features: "Advanced Nominee Assignment",
        integrations: ["Google Drive", "Dropbox Integration"],
        automatic_photo_upload: true,
        support: "Priority Support",
        extra_features: ["Voice Memo"],
      },
      _id: "674971b63d3e25604853e8a8",
      subscription_name: "Legacy (Premium)",
      created_at: "2024-11-29T07:48:06.190Z",
      __v: 0,
    },
    {
      cost: {
        monthly: null,
        yearly: null,
        custom_pricing: true,
      },
      features: {
        storage: "Custom Storage Options",
        encryption: "Top Compliance Level Encryption",
        document_sharing: "Full Sharing & Customization",
        inheritance_features: "Custom Inheritance Options",
        integrations: ["Full Suite of Integrations"],
        automatic_photo_upload: true,
        support: "24/7 Dedicated Support",
        extra_features: ["Voice Memo", "Notepad", "Customizable Solutions"],
      },
      _id: "6749728b3d3e25604853e8ab",
      subscription_name: "Heritage (Enterprise)",
      created_at: "2024-11-29T07:51:39.477Z",
      __v: 0,
    },
  ];

  useEffect(() => {
    let formattedPlans;
  
    if (plan && planType) {
      // Run filtering logic if plan and planType are defined
      formattedPlans = response
        .filter((planItem) => {
          if (plan === "Foundation (Standard)" && planType === "yearly") {
            return planItem.subscription_name !== "Foundation (Standard)";
          }
          if (plan === "Legacy (Premium)" && planType === "monthly") {
            return planItem.subscription_name !== "Foundation (Standard)";
          }
          if (plan === "Legacy (Premium)" && planType === "yearly") {
            return (
              planItem.subscription_name !== "Foundation (Standard)" &&
              planItem.subscription_name !== "Legacy (Premium)"
            );
          }
          return true;
        })
        .map((planItem) => ({
          _id: planItem._id,
          subscription_name: planItem.subscription_name,
          price: planItem.cost.monthly || "Custom Pricing",
          period: planItem.cost.monthly ? "/month" : null,
          features: [
            planItem.features.storage,
            planItem.features.encryption,
            planItem.features.document_sharing,
            planItem.features.inheritance_features,
            ...planItem.features.integrations,
            ...planItem.features.extra_features,
          ],
          buttonLabel: planItem.cost.custom_pricing ? "Contact Us" : "Subscribe Now",
          to: planItem.cost.custom_pricing ? "assistance" : "/signup",
          recommended: planItem.subscription_name === "Legacy (Premium)",
        }));
    } else {
      // If no plan or planType, show all memberships
      formattedPlans = response.map((plan) => ({
        _id: plan._id,
        subscription_name: plan.subscription_name,
        price: plan.cost.monthly || "Custom Pricing",
        period: plan.cost.monthly ? "/month" : null,
        features: [
          plan.features.storage,
          plan.features.encryption,
          plan.features.document_sharing,
          plan.features.inheritance_features,
          ...plan.features.integrations,
          ...plan.features.extra_features,
        ],
        buttonLabel: plan.cost.custom_pricing ? "Contact Us" : "Subscribe Now",
        to: plan.cost.custom_pricing ? "assistance" : "/signup",
        recommended: plan.subscription_name === "Legacy (Premium)",
      }));
    }
  
    setPlans(formattedPlans);
  }, [plan, planType, response]); // Dependencies ensure effect runs when values change
  
  

  

  const togglePlan = () => {
    setIsYearly((prev) => {
      const newIsYearly = !prev;
      
      const updatedPlans = plans.map((planItem) => {
        if (!planItem.price.includes("Custom Pricing")) {
          return {
            ...planItem,
            price: newIsYearly && response.find(p => p.subscription_name === planItem.subscription_name)?.cost.yearly
              ? response.find(p => p.subscription_name === planItem.subscription_name).cost.yearly
              : response.find(p => p.subscription_name === planItem.subscription_name)?.cost.monthly,
            period: newIsYearly ? "/year" : "/month",
          };
        }
        return planItem; // Keep custom pricing plans unchanged
      });
  
      setPlans(updatedPlans);
      return newIsYearly;
    });
  };
  
  

  const tableData = [
    { feature: "Storage", plans: ["10 GB", "20 GB", "Custom Storage"] },
    { feature: "Advanced Encryption", plans: [true, true, true] },
    { feature: "Basic Document Sharing", plans: [true, true, true] },
    { feature: "Basic Inheritance", plans: [true, true, true] },
    { feature: "Google Drive Integration", plans: [true, true, true] },
    { feature: "Standard Support", plans: [true, true, true] },
    { feature: "Top Compliance Level Encryption", plans: [false, true, true] },
    { feature: "Advanced Sharing Controls", plans: [false, true, true] },
    { feature: "Advanced Inheritance Options", plans: [false, true, true] },
    { feature: "Full Suite of Integrations", plans: [false, true, true] },
    { feature: "Automatic Photo Upload", plans: [false, true, true] },
    { feature: "Priority Support", plans: [false, true, true] },
    { feature: "Voice Memo", plans: [false, true, true] },
    { feature: "Dropbox Integration", plans: [false, true, true] },
    { feature: "Notepad", plans: [false, false, true] },
    { feature: "Customizable Solutions", plans: [false, false, true] },
  ];
  
  const planNames = [
    "Foundation (Standard)",
    "Legacy (Premium)",
    "Heritage (Enterprise)",
  ];
  

  return (
    <div className="bg-gray-100 py-10">
      <h1 className="text-3xl font-bold font-serif text-center mb-6">
        Cumulus Subscription
      </h1>
      <p class="text-center text-gray-600 mb-6">
  Upgrade to Cumulus Premium for exclusive features, advanced tools, and priority support!
</p>
<div class="flex justify-center items-center text-gray-600 mb-6">
  
  <span class="text-blue-500 font-semibold">Save Upto 60%</span>
  <span class="px-2 font-semibold">With Yearly Plan</span>
</div>
      {/* <div className="flex justify-center items-center flex-row py-2 mb-2">
        <span className="px-2 font-semibold">Monthly</span>
        <label className="relative inline-flex items-center cursor-pointer mx-2">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isYearly}
            onChange={togglePlan}
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
        <div className="flex pt-4 flex-col items-start">
          <span className="px-3 font-semibold">Yearly</span>
          <span className="text-blue-500 text-[0.7rem]">(Save Upto 60%)</span>
        </div>
      </div> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <SubscriptionCard
            key={index}
            type={plan.subscription_name}
            data={plan}
            isActive={hoveredPlan === plan.subscription_name}
            onHover={setHoveredPlan}
          />
        ))}
      </div>
      {showTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center  p-2">
          <div className="rounded-lg shadow-lg max-w-[90%] w-full">
            <div className="h-10 w-full flex justify-end min-[600px]:hidden">
              <h1>
                <button onClick={() => setShowTable(false)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-8 h-8 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 7.586l4.293-4.293a1 1 0 111.414 1.414L11.414 9l4.293 4.293a1 1 0 11-1.414 1.414L10 10.414l-4.293 4.293a1 1 0 11-1.414-1.414L8.586 9 4.293 4.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </h1>
            </div>
            <div>{/* Modal content can be placed here */}</div>
          </div>
        </div>
      )}

 
    <div className="h-10 w-full flex justify-end min-[600px]:hidden">
      <h1 className="">
        <button >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-8 h-8 text-white"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 7.586l4.293-4.293a1 1 0 111.414 1.414L11.414 9l4.293 4.293a1 1 0 11-1.414 1.414L10 10.414l-4.293 4.293a1 1 0 11-1.414-1.414L8.586 9 4.293 4.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </h1>
    </div>
   
  <div className="flex justify-center mt-10 w-full ">
  <table className="relative table-auto mx-auto text-sm sm:text-xs md:text-sm lg:text-base">
  <thead className="relative top-0 z-20 bg-black text-white">
        <tr>
        <th className="left-0  rounded-tl-xl border-r-1 p-4 md:p-8 border-white sm:p-2 text-center bg-black text-white w-[10%] md:w-[25%]">

            Features
          </th>
          {planNames.map((plan, index) => (
            <th
              key={index}
              className={`border-r-2 border-white p-4 md:p-8 text-center bg-black text-white ${
                index === planNames.length - 1 ? "rounded-tr-xl w-[25%]" : ""
              } ${index === 0 ? "border-l-2" : ""}`}
              style={{
                position: index === 0 ? "sticky" : "",
                left: index === 0 ? "119px" : "",
                zIndex: index === 0 ? "50" : "",
              }}
            >
              <div className="flex items-center justify-center relative">
                <div>{plan}</div>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td className="border-2 sticky left-0  bg-white font-semibold border-gray-300 p-4 sm:p-2 md:py-6 w-[10%] md:w-[25%]">
              {row.feature}
            </td>
            {row.plans.map((plan, planIndex) => (
              <td
                key={planIndex}
                className="border-2 border-gray-300 p-2 sm:p-1 text-center"
                style={{
                  backgroundColor:
                    planIndex === 0
                      ? "#F9FAFB"
                      : planIndex === 1
                      ? "#eef8ff"
                      : "#F9FAFB",
                  position: planIndex === 0 ? "sticky" : "",
                  left: planIndex === 0 ? "119px" : "",
                  zIndex: planIndex === 0 ? "40" : planIndex === 1 ? "40" : "",
                }}
              >
                {plan === true ? (
                  <span className="text-blue-100 flex items-center justify-center">
                    <img src={tic} className="h-8 w-8" alt="tick" />
                  </span>
                ) : plan === false ? (
                  <span></span>
                ) : (
                  plan
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>






    </div>
  );
}

export default Subscription;

import React, { useState } from 'react';
import { ConditionDashboard } from './components/ConditionDashboard';
import { ConditionListView } from './components/ConditionListView';
import { ConditionEditor } from './components/ConditionEditor';
import { Condition } from './types/condition';

// Complete conditions data based on the provided JSON
const sampleConditions: Condition[] = [
  // Product-based conditions
  {
    id: '1',
    name: 'ONDC Product Condition',
    expression: "applies_to_part == 'don:core:dvrv-in-1:devo/2gitAZKDaa:product/6'",
    effects: [
      {
        allowed_values: [
          "Buyer end cancellation",
          "Logistic end - Delivery issues",
          "ONDC - Behavioural issues",
          "ONDC - General enquiry",
          "ONDC - No Content",
          "ONDC - Refund / Return Issues",
          "ONDC - Seller Support",
          "ONDC - Seller end - Quality & Service Issues",
          "ONDC - Technical issue"
        ],
        fields: ["custom_fields.issue_category_l1"],
        show: true
      }
    ],
    expression_ast: []
  },

  // Capability-based conditions
  {
    id: '2',
    name: 'Bus Capability Condition',
    expression: "applies_to_part == 'don:core:dvrv-in-1:devo/2gitAZKDaa:capability/15'",
    effects: [
      {
        allowed_values: [
          "Bus - Blank/Missed Call",
          "Bus - Bus Type Issue",
          "Bus - City Mapping",
          "Bus - Driver details",
          "Bus - GST Releated Queries",
          "Bus - General Information",
          "Bus - General Query",
          "Bus - I have an issue related to promocode/cashback",
          "Bus - I have an issue with booking",
          "Bus - I have not received Payment confirmation",
          "Bus - I have not received booking confirmation",
          "Bus - I have not received the ticket",
          "Bus - I want information regarding upcoming travel",
          "Bus - I want to cancel my booking",
          "Bus - I would like a refund",
          "Bus - Issue with booking travel tickets using UPI",
          "Bus - Issue with booking voucher",
          "Bus - Non travel vertical issue",
          "Bus - Not able to book a bus",
          "Bus - Pre Booking issues",
          "Bus - There may be an issue with my ticket",
          "Cancel my booking",
          "Default LLM L1",
          "Journey convenience guarantee",
          "Merchant Query - Travel",
          "On time guarantee",
          "Service guarantee"
        ],
        fields: ["custom_fields.issue_category_l1"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '3',
    name: 'Flights Capability Condition',
    expression: "applies_to_part == 'don:core:dvrv-in-1:devo/2gitAZKDaa:capability/14'",
    effects: [
      {
        allowed_values: [
          "Flights - Adding Meal & Baggage",
          "Flights - Blank/Missed call",
          "Flights - Corporate Booking",
          "Flights - Direct - GDS Cancellation Queue",
          "Flights - GST Releated Queries",
          "Flights - General query",
          "Flights - GoAir Issue",
          "Flights - I have a FREE Cancellation related query",
          "Flights - I have a travel Insurance related query",
          "Flights - I have an issue related to promo code/cashback",
          "Flights - I have an issue related to promocode/cashback",
          "Flights - I have not received booking confirmation/ticket",
          "Flights - I need some additional information",
          "Flights - I want a refund under the Best Price Guaranteed program",
          "Flights - I want to cancel my booking",
          "Flights - I want to correct the traveller details",
          "Flights - I want to make changes to my booking",
          "Flights - I would like a refund",
          "Flights - I would like to give feedback about my booking experience on paytm",
          "Flights - I am having trouble booking a flight",
          "Flights - Instant Refund - Delayed Cancellation",
          "Flights - Issue with booking travel tickets using UPI",
          "Flights - Issue with ticket received",
          "Flights - Manual Cancellation Queue",
          "Flights - My problem is not listed here",
          "Flights - Non travel vertical issue",
          "Flights - Pre-Booking of Flight",
          "Flights - Proactive Refund",
          "Flights- Tech Issues",
          "Default LLM L1"
        ],
        fields: ["custom_fields.issue_category_l1"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '4',
    name: 'Train Capability Condition',
    expression: "applies_to_part == 'don:core:dvrv-in-1:devo/2gitAZKDaa:capability/16'",
    effects: [
      {
        allowed_values: [
          "Train - Blank/Missed call",
          "Train - GST Related Queries",
          "Train - General Queries",
          "Train - I have a query related to FREE Cancellation",
          "Train - I have issue related to my booked train ticket",
          "Train - I have issue with Food order",
          "Train - I want to know about Cancel Protect",
          "Train - I want to know the cancellation/modification charges",
          "Train - Issue with booking travel tickets using UPI",
          "Train - Issue with booking voucher",
          "Train - Lesser refund received",
          "Train - Modify or Cancel booking",
          "Train - My booking details",
          "Train - Non travel vertical issue",
          "Train - Offers & Promos",
          "Train - Payments and Refunds",
          "Train - TATKAL tickets",
          "Train - TDR",
          "Trains - Pre Booking issues",
          "Default LLM L1"
        ],
        fields: ["custom_fields.issue_category_l1"],
        show: true
      }
    ],
    expression_ast: []
  },

  // L1 Category-based conditions
  {
    id: '5',
    name: 'Bus Blank/Missed Call L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - Blank/Missed Call'",
    effects: [
      {
        allowed_values: [
          "Bus: Blank/Missed Call",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '6',
    name: 'Bus Type Issue L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - Bus Type Issue'",
    effects: [
      {
        allowed_values: [
          "Others",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '7',
    name: 'Bus City Mapping L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - City Mapping'",
    effects: [
      {
        allowed_values: [
          "Default LLM L2",
          "Inventory already live",
          "Missing Mappings",
          "Missing paytm Cities",
          "Not available from provider",
          "Others",
          "RTC Inventory"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '8',
    name: 'Bus Driver Details L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - Driver details'",
    effects: [
      {
        allowed_values: [
          "Information Shared",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '9',
    name: 'Bus General Information L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - General Information'",
    effects: [
      {
        allowed_values: [
          "Bus - I want information regarding upcoming travel",
          "Download Ticket",
          "How to book the ticket",
          "I want information on cancellation policies",
          "I want information on modification policies",
          "I want information on promo codes and cashback offers running right now",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '10',
    name: 'Bus General Query L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - General Query'",
    effects: [
      {
        allowed_values: [
          "Default LLM L2",
          "How to book the ticket",
          "Voucher required",
          "Want to know about promocode offers"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '11',
    name: 'Bus GST Related Queries L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - GST Releated Queries'",
    effects: [
      {
        allowed_values: [
          "GST Invoice",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '12',
    name: 'Bus Promocode/Cashback Issue L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - I have an issue related to promocode/cashback'",
    effects: [
      {
        allowed_values: [
          "I got less than expected cashback",
          "I have not yet received cashback for this booking",
          "I am not able to apply promo code",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '13',
    name: 'Bus Booking Issue L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - I have an issue with booking'",
    effects: [
      {
        allowed_values: [
          "Booking is successful and notification sent is successful",
          "Booking is successful but ticket not received",
          "I am not able to find a route",
          "Money deducted but have not got booking confirmation",
          "My problem is not listed here",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '14',
    name: 'Bus Booking Confirmation Missing L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - I have not received booking confirmation'",
    effects: [
      {
        allowed_values: [
          "Booking is successful and notification sent is successful",
          "Booking is successful but ticket not received",
          "I need help downloading my ticket",
          "Money deducted but have not got booking confirmation",
          "My problem is not listed here",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '15',
    name: 'Bus Payment Confirmation Missing L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - I have not received Payment confirmation'",
    effects: [
      {
        allowed_values: [
          "Money deducted but have not got booking confirmation",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '16',
    name: 'Bus Ticket Not Received L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - I have not received the ticket'",
    effects: [
      {
        allowed_values: [
          "Booking is successful but ticket not received",
          "I need help downloading my ticket",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '17',
    name: 'Bus Travel Information L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - I want information regarding upcoming travel'",
    effects: [
      {
        allowed_values: [
          "Boarding point clarification",
          "Bus Type query",
          "Bus timing information",
          "I want bus operator contact details",
          "I want the bus vehicle number",
          "Route enquiry",
          "Seat number query",
          "Where is my Bus",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '18',
    name: 'Bus Cancellation Request L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - I want to cancel my booking'",
    effects: [
      {
        allowed_values: [
          "Default LLM L2",
          "I want to cancel my ticket partially",
          "I want to modify my ticket",
          "There is a technical error on my ticket",
          "Unable to cancel my ticket"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '19',
    name: 'Bus Refund Request L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - I would like a refund'",
    effects: [
      {
        allowed_values: [
          "Bus details were not shared before journey",
          "Driver denied me entry to bus",
          "I bought insurance by mistake",
          "I cancelled my ticket directly with the bus operator",
          "I did not take this bus",
          "I have a dropping point issue",
          "I still haven‚Äôt got refund for my bus ticket",
          "Issue with APSRTC/TSRTC",
          "My Bus type changed",
          "My bus arrived late",
          "My bus broke down mid - journey",
          "My bus departed early",
          "My bus got cancelled",
          "Operator changed the boarding point",
          "Service Cancellation By Operator",
          "Service provided by Operator was very poor",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '20',
    name: 'Bus UPI Booking Issue L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - Issue with booking travel tickets using UPI'",
    effects: [
      {
        allowed_values: [
          "I was charged more than the transaction amount",
          "Issue with my refunds",
          "Payment done but tickets not booked",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '21',
    name: 'Bus Booking Voucher Issue L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - Issue with booking voucher'",
    effects: [
      {
        allowed_values: [
          "GST Related",
          "Invoice Required",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '22',
    name: 'Bus Non-Travel Issue L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - Non travel vertical issue'",
    effects: [
      {
        allowed_values: [
          "My problem is not listed here",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '23',
    name: 'Bus Booking Problem L1',
    expression: "custom_fields.issue_category_l1 == 'Bus - Not able to book a bus'",
    effects: [
      {
        allowed_values: [
          "Boarding Point/Dropping point issue",
          "I am having trouble paying for my Bus Ticket",
          "Incorrect Seat Booking",
          "Default LLM L2"
        ],
        fields: ["custom_fields.issue_category_l2"],
        show: true
      }
    ],
    expression_ast: []
  },

  // L2 and L3 Complex Conditions
  {
    id: '24',
    name: 'Bus Promocode Less Cashback L2->L3',
    expression: "( custom_fields.issue_category_l1 == 'Bus - I have an issue related to promocode/cashback' ) && ( custom_fields.issue_category_l2 == 'I got less than expected cashback' )",
    effects: [
      {
        allowed_values: [
          "Cashback pending_KYC not done",
          "Correct cashback processed",
          "Customer was unclear about promo T&C",
          "Delay in processing cashback",
          "Not Eligible for cashback",
          "Default LLM L3"
        ],
        fields: ["custom_fields.issue_category_l3"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '25',
    name: 'Bus Promocode No Cashback L2->L3',
    expression: "( custom_fields.issue_category_l1 == 'Bus - I have an issue related to promocode/cashback' ) && ( custom_fields.issue_category_l2 == 'I have not yet received cashback for this booking' )",
    effects: [
      {
        allowed_values: [
          "Cashback pending_KYC not done",
          "Correct cashback processed",
          "Customer was unclear about promo T&C",
          "Delay in processing cashback",
          "Not Eligible for cashback",
          "Default LLM L3"
        ],
        fields: ["custom_fields.issue_category_l3"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '26',
    name: 'Bus Promocode Apply Issue L2->L3',
    expression: "( custom_fields.issue_category_l1 == 'Bus - I have an issue related to promocode/cashback' ) && ( custom_fields.issue_category_l2 == 'I am not able to apply promo code' )",
    effects: [
      {
        allowed_values: [
          "Promo code applicable only for New users",
          "Promo code limit exceeded",
          "Promo code stuck due to previous Unauthorised/Failed txn",
          "Tech Issue",
          "Terms and Conditions not met",
          "Default LLM L3"
        ],
        fields: ["custom_fields.issue_category_l3"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '27',
    name: 'Default LLM L1->L2->L3',
    expression: "( custom_fields.issue_category_l1 == 'Default LLM L1' ) && ( custom_fields.issue_category_l2 == 'Default LLM L2' )",
    effects: [
      {
        allowed_values: [
          "Default LLM L3"
        ],
        fields: ["custom_fields.issue_category_l3"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '28',
    name: 'Journey Convenience Guarantee - Bus Breakdown',
    expression: "( custom_fields.issue_category_l1 == 'Journey convenience guarantee' ) && ( custom_fields.issue_category_l2 == 'Bus broke down mid journey' )",
    effects: [
      {
        allowed_values: [
          "Alternate Provided - No Refund",
          "Alternate Provided - with Refund",
          "Alternate not Provided - Full Refund",
          "Under Check",
          "Default LLM L3"
        ],
        fields: ["custom_fields.issue_category_l3"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '29',
    name: 'Cancel My Booking - Window Over',
    expression: "( custom_fields.issue_category_l1 == 'Cancel my booking' ) && ( custom_fields.issue_category_l2 == 'Cancellation window is over' )",
    effects: [
      {
        allowed_values: [
          "no issue found",
          "resolved",
          "Default LLM L3"
        ],
        fields: ["custom_fields.issue_category_l3"],
        show: true
      }
    ],
    expression_ast: []
  },
  {
    id: '30',
    name: 'Merchant Query - Travel Agent',
    expression: "( custom_fields.issue_category_l1 == 'Merchant Query - Travel' ) && ( custom_fields.issue_category_l2 == 'How to become travel agent' )",
    effects: [
      {
        allowed_values: [
          "Information Shared",
          "Under Check",
          "Default LLM L3"
        ],
        fields: ["custom_fields.issue_category_l3"],
        show: true
      }
    ],
    expression_ast: []
  }
];

export default function App() {
  const [conditions, setConditions] = useState<Condition[]>(sampleConditions);
  const [currentView, setCurrentView] = useState<'dashboard' | 'list' | 'editor'>('list');
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null);

  const handleCreateCondition = () => {
    setEditingCondition(null);
    setCurrentView('editor');
  };

  const handleEditCondition = (condition: Condition) => {
    setEditingCondition(condition);
    setCurrentView('editor');
  };

  const handleDeleteCondition = (id: string) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveCondition = (condition: Condition) => {
    if (editingCondition) {
      setConditions(prev => prev.map(c => c.id === condition.id ? condition : c));
    } else {
      setConditions(prev => [...prev, { ...condition, id: Date.now().toString() }]);
    }
    setCurrentView('dashboard');
    setEditingCondition(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('list');
    setEditingCondition(null);
  };

  return (
    <div className="size-full">
      {currentView === 'dashboard' ? (
        <ConditionDashboard
          conditions={conditions}
          onCreateCondition={handleCreateCondition}
          onEditCondition={handleEditCondition}
          onDeleteCondition={handleDeleteCondition}
        />
      ) : currentView === 'list' ? (
        <ConditionListView
          conditions={conditions}
          onCreateCondition={handleCreateCondition}
          onEditCondition={handleEditCondition}
          onDeleteCondition={handleDeleteCondition}
        />
      ) : (
        <ConditionEditor
          condition={editingCondition}
          onSave={handleSaveCondition}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}
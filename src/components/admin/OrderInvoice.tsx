"use client";

import React from "react";


interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantName?: string;
}

interface Order {
  id: string;
  createdAt: string;
  total?: number;
  totalAmount?: number;
  subtotal?: number;
  deliveryCharge?: number;
  paymentStatus?: string;
  orderStatus?: string;
  userEmail?: string;
  payment?: { method?: string; senderNumber?: string; transactionId?: string; accountUsed?: string };
  paymentDetails?: { method?: string; senderNumber?: string; transactionId?: string; accountUsed?: string };
  shippingAddress?: { fullName?: string; phone?: string; address?: string; city?: string; postalCode?: string };
  customer?: { name?: string; phone?: string; address?: string; city?: string; email?: string };
  items: OrderItem[];
}

interface OrderInvoiceProps {
  order: Order;
  currency: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  storeWebsite?: string;
  logoUrl?: string; // We'll keep support but the new design focus is on typography
  signatureUrl?: string;
}

const OrderInvoice: React.FC<OrderInvoiceProps> = ({
  order,
  currency,
  storeName = "Afra Tech Point",
  storeAddress = "House-12, Sector-07, Uttara, Dhaka-1230",
  storePhone = "+880 1XXXXXXXXX",
  storeEmail = "support@afratechpoint.com",
  storeWebsite = "www.afratechpoint.com",
  logoUrl,
  signatureUrl
}) => {
  const total = order.totalAmount ?? order.total ?? 0;
  const subtotal = order.subtotal ?? (total - (order.deliveryCharge ?? 0));
  const pmt = order.payment ?? order.paymentDetails ?? {};
  const addr = order.shippingAddress;
  const cust = order.customer;
  const clientName = addr?.fullName ?? cust?.name ?? "Customer";
  const clientPhone = addr?.phone ?? cust?.phone ?? "No phone";
  const clientAddress = [addr?.address ?? cust?.address, addr?.city ?? cust?.city, addr?.postalCode].filter(Boolean).join(", ");
  
  const fmt = (n: number) => currency + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div id="invoice-container" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', background: '#fff' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

        .inv-wrapper, .inv-wrapper *, .inv-wrapper *::before, .inv-wrapper *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .inv-wrapper{
          background:#fff;
          font-family:'Courier Prime','Courier New',monospace;
          color:#111;
          width: 148mm;
          min-height: 210mm;
          margin: 0 auto;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .bar{background:#111;height:12px;width:100%;flex-shrink:0;}

        /* Top */
        .inv-top{
          padding:24px 32px 16px;
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
        }
        .inv-h1{
          font-weight:700;
          font-size:28px;
          text-transform:uppercase;
          letter-spacing:-0.5px;
          line-height:1;
        }
        .inv-meta{
          margin-top:10px;
          font-size:10px;
          line-height:1.8;
        }
        .co-name{
          font-weight:700;
          font-size:18px;
          text-transform:uppercase;
          letter-spacing:-0.5px;
          text-align:right;
          line-height:1;
        }
        .co-info{
          text-align:right;
          font-size:10px;
          line-height:1.8;
          margin-top:8px;
        }

        /* Bill To */
        .billto{padding:4px 32px 20px;}
        .sec-title{
          font-weight:700;
          font-size:16px;
          text-transform:uppercase;
          margin-bottom:6px;
        }
        .billto-info{font-size:10px;line-height:1.7;}

        /* Table */
        .tbl{padding:0 32px;}
        .tbl-head{
          background:#111;
          color:#fff;
          display:grid;
          grid-template-columns:30px 1fr 40px 65px 65px;
          padding:10px;
          font-size:8px;
          font-weight:700;
          letter-spacing:1.5px;
          text-transform:uppercase;
          gap:6px;
        }
        .tbl-head>*:nth-child(n+3){text-align:right;}

        .tbl-row{
          display:grid;
          grid-template-columns:30px 1fr 40px 65px 65px;
          padding:10px;
          border-bottom:1px solid #ddd;
          align-items:center;
          font-size:9.5px;
          gap:6px;
        }
        .tbl-row>*:nth-child(n+3){text-align:right;}
        .rnum{font-weight:700;}

        .item-cell{display:flex;align-items:center;gap:8px;}
        .item-img{
          width:36px;height:36px;
          object-fit:cover;
          border:1px solid #ccc;
          flex-shrink:0;
        }
        .item-name{font-size:9px;line-height:1.4;}

        /* Totals */
        .totals{
          padding:12px 32px 8px;
          display:flex;
          justify-content:flex-end;
          flex-shrink:0;
        }
        .totals-inner{width:180px;}
        .tot-row{
          display:flex;
          justify-content:space-between;
          font-size:10px;
          padding:4px 0;
        }
        .tot-final{
          background:#f2f2f2;
          border:2px solid #111;
          margin-top:10px;
          padding:10px 12px;
          font-weight:700;
          font-size:14px;
          letter-spacing:0.5px;
          text-transform:uppercase;
          display:flex;
          justify-content:space-between;
        }

        /* Footer pushes to bottom automatically due to flex column */
        .inv-footer {
          margin-top: auto;
          width: 100%;
        }

        /* Bottom */
        .inv-bottom{
          padding:16px 32px 8px;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:20px;
        }
        .bot-title{
          font-weight:700;
          font-size:9.5px;
          text-transform:uppercase;
          letter-spacing:1px;
          text-decoration:underline;
          text-underline-offset:2px;
          margin-bottom:6px;
        }
        .bot-info{font-size:9px;line-height:1.7;}
        .bot-info strong{font-weight:700;}

        .bar-bot{background:#111;height:12px;width:100%;flex-shrink:0;}
        
        .sign-area{
          width: 100%; max-width: 140px;
          border-bottom: 1px solid #111;
          margin-bottom: 6px;
          display: flex; align-items: center; justify-content: center;
          min-height: 48px;
          position: relative;
        }
        .sign-img {
          max-height: 48px; object-fit: contain; mix-blend-mode: multiply; margin: 0 auto;
        }
        .sign-meta{
          font-size: 8px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8; text-align: center;
        }
      `}} />

      <div className="inv-wrapper">
        <div className="bar" />

        <div className="inv-top">
          <div>
            <div className="inv-h1">Invoice</div>
            <div className="inv-meta">
              Invoice Number: INV-{order.id.slice(0, 8).toUpperCase()}<br />
              Date: {new Date(order.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div>
            <div className="co-name">{storeName}</div>
            <div className="co-info">
              {storePhone}<br />
              {storeAddress}
            </div>
          </div>
        </div>

        <div style={{ padding: '4px 32px 20px', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          {/* Bill To */}
          <div style={{ flex: 1 }}>
            <div className="sec-title">Bill To:</div>
            <div className="billto-info">
              <strong>{clientName}</strong><br />
              {clientAddress}<br />
              {clientPhone}<br />
              {order.userEmail && <>{order.userEmail}</>}
            </div>
          </div>

          {/* Payment Info */}
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div className="sec-title">Payment Info:</div>
            <div className="billto-info">
              <strong>Method:</strong> {pmt.method || "Cash on Delivery"}<br />
              {pmt.transactionId && <><strong>Trx ID:</strong> {pmt.transactionId}<br /></>}
              {pmt.accountUsed && <><strong>Account:</strong> {pmt.accountUsed}<br /></>}
              <strong>Status:</strong> {order.paymentStatus || "Pending"}
            </div>
          </div>
        </div>

        <div className="tbl">
          <div className="tbl-head">
            <span>Item</span>
            <span>Description</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Amount</span>
          </div>

          {order.items.map((item, idx) => (
            <div className="tbl-row" key={idx}>
              <div className="rnum">{idx + 1}.</div>
              <div className="item-cell">
                {item.image && <img className="item-img" crossOrigin="anonymous" src={item.image} alt={item.name} />}
                <div style={{display: 'flex', flexDirection: 'column'}}>
                   <span className="item-name">{item.name}</span>
                   {item.variantName && <span style={{fontSize: '8px', color: '#666', marginTop: '2px', textTransform: 'uppercase'}}>{item.variantName}</span>}
                </div>
              </div>
              <div>{item.quantity.toString().padStart(2, '0')}</div>
              <div>{fmt(item.price)}</div>
              <div style={{fontWeight: 700}}>{fmt(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="totals">
          <div className="totals-inner">
            <div className="tot-row">
              <span>Sub Total:</span><span>{fmt(subtotal)}</span>
            </div>
            <div className="tot-row">
              <span>Shipping Fee:</span><span>{fmt(order.deliveryCharge || 0)}</span>
            </div>
            <div className="tot-final">
              <span>Total:</span><span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* This wrapper is pushed to the bottom of the page */}
        <div className="inv-footer">
          <div className="inv-bottom" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '24px' }}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: '50%'}}>
               <div className="sign-area">
                  {signatureUrl && (
                    <img crossOrigin="anonymous" src={signatureUrl} alt="Signature" className="sign-img" />
                  )}
               </div>
               <p className="sign-meta">Authorized Signature</p>
            </div>
          </div>

          <div className="inv-bottom" style={{paddingTop: 0, paddingBottom: 24, display: 'block'}}>
             <div className="bot-title">Terms and Conditions:</div>
             <div className="bot-info" style={{color: '#475569'}}>
               Thank you for choosing {storeName}. Items can be returned within 7 days of delivery 
               if all original tags and packaging are intact. This is a computer-generated invoice.
             </div>
          </div>

          <div className="bar-bot" />
        </div>
      </div>
    </div>
  );

};

export default OrderInvoice;

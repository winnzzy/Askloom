import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

export default function AskLoomHeader(props: any) {
    const { appUrl, pricingHref, methodologyHref, trendsHref } = props
    return (
        <div style={{width:"100%",display:"flex",justifyContent:"center",padding:"18px 20px",boxSizing:"border-box"}}>
            <div style={{width:"100%",maxWidth:1240,height:66,border:"1px solid rgba(255,255,255,.10)",background:"rgba(14,18,32,.76)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px 0 22px",boxSizing:"border-box",boxShadow:"0 14px 50px rgba(4,7,18,.20)"}}>
                <a href="/" style={{textDecoration:"none",color:"#F6F0E4",fontFamily:"Inter, sans-serif",fontWeight:760,fontSize:23,letterSpacing:"-.05em"}}>Ask<span style={{color:"#B89CFF"}}>Loom</span></a>
                <div style={{display:"flex",alignItems:"center",gap:28,fontFamily:"Inter, sans-serif",fontSize:13,fontWeight:620}} className="askloom-desktop-nav">
                    <a href={trendsHref} style={link}>Trends</a><a href={methodologyHref} style={link}>Methodology</a><a href={pricingHref} style={link}>Pricing</a>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <a href={`${appUrl}/`} style={{...secondary}}>Log in</a>
                    <a href={`${appUrl}/`} style={{...primary}}>Open AskLoom <span style={{fontSize:15}}>↗</span></a>
                </div>
            </div>
        </div>
    )
}
const link: React.CSSProperties={color:"rgba(246,240,228,.66)",textDecoration:"none"}
const secondary: React.CSSProperties={color:"#F6F0E4",textDecoration:"none",fontFamily:"Inter, sans-serif",fontWeight:650,fontSize:13,padding:"10px 13px"}
const primary: React.CSSProperties={color:"#15182A",textDecoration:"none",fontFamily:"Inter, sans-serif",fontWeight:760,fontSize:13,padding:"13px 17px",borderRadius:11,background:"#F3D777",boxShadow:"0 8px 26px rgba(243,215,119,.16)"}
AskLoomHeader.defaultProps={appUrl:"https://askloom-frontend.onrender.com",pricingHref:"#pricing",methodologyHref:"/methodology",trendsHref:"/trends"}
addPropertyControls(AskLoomHeader,{appUrl:{type:ControlType.String,title:"App URL"},trendsHref:{type:ControlType.String,title:"Trends"},methodologyHref:{type:ControlType.String,title:"Methodology"},pricingHref:{type:ControlType.String,title:"Pricing"}})

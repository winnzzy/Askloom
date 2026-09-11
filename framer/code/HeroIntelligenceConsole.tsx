import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

const rows=[
 {score:94,title:"AI agents for small businesses",meta:"Google + YouTube",delta:"+38%"},
 {score:89,title:"Will AI agents replace assistants?",meta:"Question intent",delta:"+27%"},
 {score:84,title:"AI customer service agents",meta:"Commercial intent",delta:"+19%"},
]

export default function HeroIntelligenceConsole(props:any){
 const {topic,signalCount,questionCount,clusterCount}=props
 return <div style={{width:"100%",height:"100%",minHeight:500,borderRadius:28,border:"1px solid rgba(255,255,255,.10)",background:"linear-gradient(180deg,rgba(24,29,50,.96),rgba(14,18,31,.98))",boxShadow:"0 40px 100px rgba(5,8,18,.35)",padding:24,boxSizing:"border-box",color:"#F7F1E6",fontFamily:"Inter,sans-serif",overflow:"hidden",position:"relative"}}>
   <div style={{position:"absolute",width:220,height:220,borderRadius:"50%",background:"rgba(118,83,255,.18)",filter:"blur(70px)",right:-30,top:-40}}/>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative"}}><span style={{fontSize:11,letterSpacing:".12em",fontWeight:800,color:"#AAA4BC"}}>LIVE OPPORTUNITY MAP</span><span style={{fontSize:11,padding:"7px 10px",borderRadius:999,border:"1px solid rgba(132,241,190,.22)",color:"#9BE3BD",background:"rgba(85,193,139,.08)"}}>● Research preview</span></div>
   <div style={{padding:"42px 2px 26px",position:"relative"}}><div style={{fontSize:11,color:"#817B91",textTransform:"uppercase",letterSpacing:".12em"}}>Topic</div><div style={{fontSize:42,fontWeight:670,letterSpacing:"-.055em",marginTop:7}}>{topic}</div><div style={{fontSize:14,color:"#B6B0C2",marginTop:8}}>Audience interest is accelerating across creator research.</div></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,position:"relative"}}>{[[signalCount,"signals"],[questionCount,"questions"],[clusterCount,"clusters"]].map(([v,l]:any)=><div key={l} style={{padding:"17px 16px",background:"rgba(255,255,255,.045)",border:"1px solid rgba(255,255,255,.07)",borderRadius:15}}><div style={{fontSize:23,fontWeight:760,letterSpacing:"-.04em"}}>{v}</div><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".1em",color:"#837D91",marginTop:4}}>{l}</div></div>)}</div>
   <div style={{marginTop:16,display:"grid",gap:9,position:"relative"}}>{rows.map((r)=><div key={r.title} style={{display:"grid",gridTemplateColumns:"58px 1fr auto",alignItems:"center",gap:12,padding:"13px 14px",borderRadius:14,border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.035)"}}><div style={{width:48,height:48,borderRadius:14,border:"1px solid rgba(243,215,119,.34)",display:"grid",placeItems:"center",fontWeight:800,color:"#F3D777"}}>{r.score}</div><div><div style={{fontSize:14,fontWeight:700}}>{r.title}</div><div style={{fontSize:11,color:"#8F899C",marginTop:4}}>{r.meta}</div></div><div style={{fontSize:12,fontWeight:780,color:"#9BE3BD"}}>{r.delta}</div></div>)}</div>
   <div style={{marginTop:18,fontSize:10,color:"#777184",lineHeight:1.5}}>Preview values are illustrative. Live AskLoom surfaces use first-party methodology and clearly label source evidence.</div>
 </div>
}
HeroIntelligenceConsole.defaultProps={topic:"AI agents",signalCount:"2,481",questionCount:"387",clusterCount:"42"}
addPropertyControls(HeroIntelligenceConsole,{topic:{type:ControlType.String,title:"Topic"},signalCount:{type:ControlType.String,title:"Signals"},questionCount:{type:ControlType.String,title:"Questions"},clusterCount:{type:ControlType.String,title:"Clusters"}})

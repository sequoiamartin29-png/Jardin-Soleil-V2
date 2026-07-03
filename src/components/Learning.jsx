import React from "react";

const lessons = [
  {
    icon: "🌳",
    title: "Orchard Academy",
    description: "Learn fruit tree care, pruning, grafting and harvesting."
  },
  {
    icon: "🌿",
    title: "Herb Academy",
    description: "Medicinal herbs, tea plants and culinary herbs."
  },
  {
    icon: "🥕",
    title: "Vegetable Academy",
    description: "Growing vegetables from seed to harvest."
  },
  {
    icon: "📖",
    title: "Botanical Vocabulary",
    description: "Study horticulture and botany terms."
  },
  {
    icon: "🎮",
    title: "Word Search",
    description: "Play unlimited horticulture word search puzzles."
  },
  {
    icon: "🏆",
    title: "Garden Challenges",
    description: "Complete daily and seasonal gardening challenges."
  }
];

export default function Learning() {

return (

<section
style={{
marginTop:"50px"
}}
>

<h2
style={{
fontSize:"42px",
color:"#5D6B46"
}}
>
🎓 Learning Center
</h2>

<p
style={{
color:"#777",
fontSize:"18px",
marginBottom:"35px"
}}
>
Master horticulture while building Jardin Soleil.
</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
gap:"24px"
}}
>
  {lessons.map((lesson) => (

<article
key={lesson.title}
style={{
background:"#FFFDF9",
borderRadius:"28px",
padding:"26px",
border:"1px solid #EFE5D8",
boxShadow:"0 12px 28px rgba(0,0,0,.08)"
}}
>

<div
style={{
fontSize:"56px"
}}
>
{lesson.icon}
</div>

<h3
style={{
color:"#53633F",
fontSize:"28px"
}}
>
{lesson.title}
</h3>

<p
style={{
color:"#666",
lineHeight:"1.8",
minHeight:"70px"
}}
>
{lesson.description}
</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:"10px",
marginTop:"20px"
}}
>

<button>
📚 Open
</button>

<button>
⭐ Favorites
</button>

</div>

<div
style={{
marginTop:"20px",
paddingTop:"16px",
borderTop:"1px solid #ECE4D8",
display:"flex",
justifyContent:"space-between",
fontSize:"14px",
color:"#777"
}}
>

<span>🎯 Beginner</span>

<span>✔ Available</span>

</div>

</article>

))}
  </div>

<div
style={{
marginTop:"35px",
background:"#F8F3EC",
borderRadius:"24px",
padding:"28px",
border:"1px solid #EFE5D8"
}}
>

<h3
style={{
marginTop:0,
color:"#5D6B46"
}}
>
🌿 Coming Soon
</h3>

<ul
style={{
lineHeight:"2"
}}
>
<li>🤖 Plant Identification AI</li>
<li>🐛 Pest Identification AI</li>
<li>🦠 Disease Identification AI</li>
<li>🎮 Unlimited Word Search Generator</li>
<li>📝 Interactive Garden Quizzes</li>
<li>🏅 Achievement & Badge System</li>
<li>📖 Complete Horticulture Encyclopedia</li>
</ul>

</div>

</section>

);

}

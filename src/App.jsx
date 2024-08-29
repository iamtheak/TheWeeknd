import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import "./App.css";
import afterhours from "./assets/img/afterhours.jpeg";
import bbtm from "./assets/img/bbtm.jpeg";
import dawnfm from "./assets/img/dawnfm.jpeg";
import eos from "./assets/img/eos.jpeg";
import hob from "./assets/img/hob.jpg";
import kissland from "./assets/img/kissland.jpeg";
import mdm from "./assets/img/mdm.jpeg";
import starboy from "./assets/img/starboy.jpeg";
import thusrday from "./assets/img/thursday.jpg";
import Marquee from "./components/marquee";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function App() {
  const [color, setColor] = useState("202020");
  const [isMouseOver, setIsMouseOver] = useState(false);

  const images = [
    { src: hob, alt: "House of Balloons", color: "202020" },
    { src: thusrday, alt: "Thursday", color: "202020" },
    { src: eos, alt: "Echoes of Silence", color: "202020" },
    { src: kissland, alt: "Kiss Land", color: "0c5f3d" },
    { src: bbtm, alt: "Beauty Behind the Madness", color: "8b8b8c" },
    { src: mdm, alt: "My Dear Melancholy", color: "903413" },
    { src: starboy, alt: "Starboy", color: "c40b35" },
    { src: afterhours, alt: "After Hours", color: "7b261b" },
    { src: dawnfm, alt: "Dawn FM", color: "1a3b49" },
  ];

  const mainDivRef = useRef(null);
  const mainRef = useRef(null);

  useGSAP(() => {
    if (mainDivRef.current === null) return;

    let curr = mainDivRef.current;
    let children = curr.children;
    if (!children) return;
    let imageDivs = gsap.utils.toArray(".img-holder");
    if (imageDivs.length === 0) return;

    let tl = gsap.timeline({
      defaults: {
        ease: "none",
      },
      scrollTrigger: {
        trigger: ".main-div",
        start: "top top",
        end: "+=" + mainRef.current.offsetWidth * 9,
        scrub: 3,
        snap: {
          snapTo: 1 / (imageDivs.length - 1),
          duration: { min: 0.5, max: 0.8 },
        },
        pin: ".main",
        pinSpacing: true,
        onSnapComplete: (self) => {
          let index = Math.round(self.progress * (imageDivs.length - 1));
          mainRef.current.style.backgroundColor = `green}`;
        },
      },
    });

    tl.fromTo(
      ".main-div",
      {
        xPercent: 0,
      },
      {
        xPercent: -89,
      }
    );

    imageDivs.forEach((div, index) => {
      tl.from(div, {
        scrollTrigger: {
          trigger: div,
          start: "left center",
          end: "right center",
          containerAnimation: tl,
          onEnter: () => {
            setColor(images[index].color);
          },
          onEnterBack: () => {
            setColor(images[index].color);
          },
        },
      });
    });

    let marqueeParts = gsap.utils.toArray(".marquee-part");
    let tween = gsap
      .to(marqueeParts, {
        xPercent: -100,
        duration: 2,
        repeat: -1,
        ease: "linear",
      })
      .totalProgress(0.5);
  });

  return (
    <div
      ref={mainRef}
      style={{ backgroundColor: "#" + color }}
      className="main"
    >
      <div ref={mainDivRef} className="main-div">
        {images.map((image, index) => {
          return (
            <div className="img-holder" key={index}>
              <img
                onMouseEnter={() => {
                  setIsMouseOver(true);
                  console.log("mouse enter");
                }}
                onMouseLeave={() => {
                  setIsMouseOver(false);
                  console.log("mouse leave");
                }}
                src={image.src}
                data-color={image.color}
                className="img"
                alt={image.alt}
              />
            </div>
          );
        })}
      </div>

      <Marquee
        isMouseOver={isMouseOver}
        word={"The Weeknd"}
        direction="left"
        count={8}
        pos="20%"
      />

      <Marquee
        isMouseOver={isMouseOver}
        word={"XO"}
        direction="right"
        count={8}
        pos="60%"
      />
    </div>
  );
}

export default App;

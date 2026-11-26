import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";
import "./marquee.css";

const Marquee = ({
  direction = "left",
  word,
  count,
  isMouseOver,
  pos = "10%",
}) => {
  const array = new Array(count).fill(word);

  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);

  useGSAP(
    () => {
      if (marqueeRef.current === null) return;
      if (marqueeInnerRef.current === null) return;

      let marqueeParts = marqueeInnerRef.current.children;

      let tween = gsap
        .to(marqueeParts, {
          xPercent: -100,
          duration: 2,
          repeat: -1,
          ease: "linear",
        })
        .totalProgress(0.5);

      if (direction === "right") {
        gsap.to(tween, { timeScale: -1 });
      }
    },
    { dependencies: [direction], scope: marqueeRef },
  );

  return (
    <div
      ref={marqueeRef}
      className={"marquee" + (isMouseOver ? " active" : "")}
      style={{ top: pos }}
    >
      <div ref={marqueeInnerRef} className="marquee-inner">
        {array.map((item, index) => {
          return (
            <div className="marquee-part" key={index}>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Marquee;

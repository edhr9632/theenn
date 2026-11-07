const SPARK_COLORS = ["gold", "rose", "ivory", "amber", "crimson", "sky"] as const;

function CenterCrackerBlast({ burstDelay }: { burstDelay: string }) {
  const sparks = Array.from({ length: 16 }, (_, index) => {
    const angle = (360 / 16) * index + (index % 2) * 7;
    const distance = 26 + (index % 5) * 9;
    return {
      id: index,
      color: SPARK_COLORS[index % SPARK_COLORS.length],
      angle: `${angle}deg`,
      distance: `${distance}px`,
      delay: `${(index % 5) * 0.03}s`,
    };
  });

  return (
    <span className="diwali-center-blast" style={{ ["--blast-delay" as string]: burstDelay }} aria-hidden="true">
      <span className="diwali-center-blast-core" />
      {sparks.map((spark) => (
        <i
          key={spark.id}
          className={`diwali-center-spark diwali-center-spark--${spark.color}`}
          style={{
            ["--spark-angle" as string]: spark.angle,
            ["--spark-distance" as string]: spark.distance,
            ["--spark-delay" as string]: spark.delay,
          }}
        />
      ))}
    </span>
  );
}

/** Festive Diwali sky GIF banner with soft center blasts. */
export default function HappyDiwaliBar() {
  return (
    <div className="happy-diwali-bar happy-diwali-bar--image" role="img" aria-label="Happy Diwali">
      {/* Native img so animated GIF loops correctly (next/image can flatten GIFs). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="happy-diwali-sky-img"
        src="/gif/happy-diwali-sky.gif"
        alt="Happy Diwali festive sky with lanterns"
      />
      <div className="happy-diwali-center">
        <CenterCrackerBlast burstDelay="0s" />
        <CenterCrackerBlast burstDelay="2.2s" />
      </div>
    </div>
  );
}

import { PFQ_TRAP_SCHOOL } from "@/lib/pfq/trap-school-content";
import styles from "./PfqTrapSchool.module.css";

/**
 * Paid Trap School module. Content from PFQ_TRAP_SCHOOL.md — figures verbatim.
 */
export default function PfqTrapSchool() {
  const c = PFQ_TRAP_SCHOOL;

  return (
    <article className={styles.root}>
      <header className={styles.header}>
        <p className={styles.kicker}>Trap School</p>
        <h1 className={styles.title}>{c.why.title}</h1>
        <p className={styles.lede}>{c.why.body}</p>
      </header>

      {c.traps.map((trap) => (
        <section key={trap.id} className={styles.section} id={trap.id}>
          <h2 className={styles.h2}>{trap.title}</h2>
          {"frequency" in trap && trap.frequency ? (
            <p className={styles.meta}>{trap.frequency}</p>
          ) : null}
          {"examples" in trap && trap.examples ? (
            <ul className={styles.examples}>
              {trap.examples.map((ex) => (
                <li key={ex}>
                  <em>{ex}</em>
                </li>
              ))}
            </ul>
          ) : null}
          {"exampleBlock" in trap && trap.exampleBlock ? (
            <pre className={styles.exampleBlock}>{trap.exampleBlock}</pre>
          ) : null}
          <p className={styles.body}>{trap.body}</p>
          {"body2" in trap && trap.body2 ? (
            <p className={styles.body}>{trap.body2}</p>
          ) : null}
          {"pairsIntro" in trap && trap.pairsIntro ? (
            <p className={styles.body}>{trap.pairsIntro}</p>
          ) : null}
          {"pairs" in trap && trap.pairs ? (
            <ul className={styles.pairs}>
              {trap.pairs.map((pair) => (
                <li key={pair.confused}>
                  <strong>{pair.confused}</strong>
                  <span> — {pair.holdApart}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {"whatToDo" in trap && trap.whatToDo ? (
            <p className={styles.do}>
              <strong>What to do: </strong>
              {trap.whatToDo}
            </p>
          ) : null}
          {"extra" in trap && trap.extra ? (
            <p className={styles.body}>{trap.extra}</p>
          ) : null}
        </section>
      ))}

      <section className={styles.section} id="clock">
        <h2 className={styles.h2}>{c.clock.title}</h2>
        <p className={styles.body}>{c.clock.intro}</p>
        <ul className={styles.bullets}>
          {c.clock.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className={styles.body}>{c.clock.rule}</p>
        <p className={styles.body}>{c.clock.lastFive}</p>
      </section>

      <p className={styles.oneLiner}>{c.oneLiner}</p>
    </article>
  );
}

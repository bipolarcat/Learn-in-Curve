import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type {
  MeterTier,
  PerLoMeter,
  WeakLoNote,
} from "@/lib/tutor/course-report";
import {
  meterBarFill,
  meterTierColor,
  meterTierLabel,
} from "@/lib/tutor/course-report";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#241A12",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#5C4A36",
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginTop: 14,
    marginBottom: 8,
  },
  loRow: {
    marginBottom: 8,
  },
  loHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  loTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  loTier: {
    fontSize: 8,
  },
  barTrack: {
    height: 7,
    borderRadius: 3,
    backgroundColor: "#E8DCC4",
    overflow: "hidden",
  },
  barFill: {
    height: 7,
    borderRadius: 3,
  },
  note: {
    marginTop: 2,
    fontSize: 8,
    color: "#5C4A36",
  },
  bullet: {
    marginBottom: 4,
    paddingLeft: 6,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9A8B78",
  },
});

type CourseReportPdfProps = {
  courseName: string;
  generatedAt: string;
  perLo: PerLoMeter[];
  keyTakeaways: string[];
  weakLoNotes: WeakLoNote[];
  improvementTips: string[];
};

function noteForLo(notes: WeakLoNote[], loNumber: number): string | null {
  return notes.find((n) => n.loNumber === loNumber)?.note ?? null;
}

export function CourseReportPdfDocument({
  courseName,
  generatedAt,
  perLo,
  keyTakeaways,
  weakLoNotes,
  improvementTips,
}: CourseReportPdfProps) {
  const dateLabel = new Date(generatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Document title={`${courseName} — end-of-course report`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>End-of-course report</Text>
        <Text style={styles.subtitle}>
          {courseName} · Generated {dateLabel}
        </Text>

        <Text style={styles.sectionTitle}>Strength by learning objective</Text>
        {perLo.map((lo) => {
          const color = meterTierColor(lo.tier);
          const fill = meterBarFill(lo.tier);
          const note = noteForLo(weakLoNotes, lo.loNumber);
          return (
            <View key={lo.loNumber} style={styles.loRow} wrap={false}>
              <View style={styles.loHeader}>
                <Text style={styles.loTitle}>LO {lo.loNumber}</Text>
                <Text style={[styles.loTier, { color }]}>
                  {meterTierLabel(lo.tier as MeterTier)}
                  {lo.totalCount > 0
                    ? ` · ${lo.totalCount - lo.wrongCount}/${lo.totalCount}`
                    : ""}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.round(fill * 100)}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              {note ? <Text style={styles.note}>{note}</Text> : null}
            </View>
          );
        })}

        <Text style={styles.sectionTitle}>Key takeaways</Text>
        {keyTakeaways.map((t, i) => (
          <Text key={i} style={styles.bullet}>
            • {t}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>How to improve</Text>
        {improvementTips.length === 0 ? (
          <Text style={styles.bullet}>
            • Keep practising your weaker LOs before the mock.
          </Text>
        ) : (
          improvementTips.map((t, i) => (
            <Text key={i} style={styles.bullet}>
              • {t}
            </Text>
          ))
        )}

        <Text style={styles.footer} fixed>
          Learn in Curve · Scores from your quiz attempts · Tips generated for
          you
        </Text>
      </Page>
    </Document>
  );
}

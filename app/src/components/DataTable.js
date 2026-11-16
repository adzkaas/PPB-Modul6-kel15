import { memo, useEffect, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { tokens } from "../theme/tokens.js";

const { color, space, radius, shadow } = tokens;

function SkeletonRows({ count = 3 }) {
  return (
    <View accessible accessibilityLabel="Loading data">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dataRow, i === 0 && styles.firstDataRow]}>
          <View style={[styles.skeleton, { flex: 1.4 }]} />
          <View style={[styles.skeleton, { flex: 0.9 }]} />
          <View style={[styles.skeleton, { flex: 0.9 }]} />
        </View>
      ))}
    </View>
  );
}

const DataRow = memo(function DataRow({ item, columns, isFirst }) {
  const a11yLabel = columns
    .map((c) => {
      const raw = item[c.key];
      const rendered = c.render ? c.render(raw, item) : raw;
      const secondary = c.renderSecondary ? c.renderSecondary(raw, item) : null;
      return `${c.title} ${rendered ?? "--"}${secondary ? ` ${secondary}` : ""}`;
    })
    .join(", ");
  return (
    <View
      style={[styles.dataRow, isFirst && styles.firstDataRow]}
      accessible
      accessibilityLabel={a11yLabel}
    >
      {columns.map((column) => {
        const raw = item[column.key];
        const rendered = column.render ? column.render(raw, item) : raw;
        const secondary = column.renderSecondary
          ? column.renderSecondary(raw, item)
          : null;
        const isEmptyDash = rendered === "-" || rendered === "—";
        return (
          <View
            key={column.key}
            style={[
              styles.cellWrap,
              { flex: column.flex ?? 1 },
              column.numeric && styles.numericWrap,
            ]}
          >
            <Text
              style={[
                styles.cell,
                column.numeric && styles.numericCell,
                isEmptyDash && styles.dashCell,
              ]}
              numberOfLines={2}
            >
              {rendered ?? "--"}
            </Text>
            {secondary != null ? (
              <Text style={styles.secondaryCell} numberOfLines={1}>
                {secondary}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
});

export function DataTable({
  columns,
  data,
  keyExtractor,
  emptyTitle = "No data yet",
  emptyMessage = "Items will appear here.",
  emptyActionLabel,
  onEmptyAction,
  loading = false,
  loadingRows = 3,
  enablePagination = false,
  pageSize = 5,
  prevLabel = "Sebelumnya",
  nextLabel = "Berikutnya",
}) {
  if (!columns?.length) {
    return null;
  }

  const hasData = Array.isArray(data) && data.length > 0;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = hasData ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const displayData = enablePagination && hasData
    ? data.slice(startIndex, startIndex + pageSize)
    : data;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel="Data table"
      accessibilityRole="none"
    >
      <View style={styles.headerRow} accessibilityRole="header">
        {columns.map((column) => (
          <Text
            key={column.key}
            style={[
              styles.headerCell,
              { flex: column.flex ?? 1 },
              column.numeric && styles.numericCell,
            ]}
            numberOfLines={1}
          >
            {column.title}
          </Text>
        ))}
      </View>
      {loading ? (
        <SkeletonRows count={loadingRows} />
      ) : hasData ? (
        displayData.map((item, index) => (
          <DataRow
            key={keyExtractor ? keyExtractor(item, startIndex + index) : String(startIndex + index)}
            item={item}
            columns={columns}
            isFirst={index === 0}
          />
        ))
      ) : (
        <View style={styles.emptyWrap}>
          <Ionicons name="file-tray-outline" size={24} color={color.text3} />
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyMessage}>{emptyMessage}</Text>
          {emptyActionLabel && onEmptyAction ? (
            <Pressable
              style={({ pressed }) => [
                styles.emptyAction,
                pressed && styles.pressed,
              ]}
              onPress={onEmptyAction}
              accessibilityLabel={emptyActionLabel}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={styles.emptyActionText}>{emptyActionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {/* Pagination Footer Controls */}
      {enablePagination && hasData && !loading ? (
        <View style={styles.paginationContainer}>
          <View style={styles.pageInfoWrap}>
            <Text style={styles.pageInfoText}>
              Hal <Text style={styles.pageInfoBold}>{currentPage}</Text> dari{" "}
              <Text style={styles.pageInfoBold}>{totalPages}</Text>
            </Text>
            <Text style={styles.pageRangeText}>
              ({startIndex + 1}–{Math.min(data.length, startIndex + pageSize)} dari {data.length} data)
            </Text>
          </View>

          <View style={styles.paginationButtonsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.pageButton,
                currentPage <= 1 && styles.pageButtonDisabled,
                pressed && currentPage > 1 && styles.pressed,
              ]}
              disabled={currentPage <= 1}
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              accessibilityLabel="Halaman sebelumnya"
              accessibilityRole="button"
            >
              <Ionicons
                name="chevron-back"
                size={14}
                color={currentPage <= 1 ? color.text3 : color.primary}
              />
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage <= 1 && styles.pageButtonTextDisabled,
                ]}
              >
                {prevLabel}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.pageButton,
                currentPage >= totalPages && styles.pageButtonDisabled,
                pressed && currentPage < totalPages && styles.pressed,
              ]}
              disabled={currentPage >= totalPages}
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              accessibilityLabel="Halaman berikutnya"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage >= totalPages && styles.pageButtonTextDisabled,
                ]}
              >
                {nextLabel}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={currentPage >= totalPages ? color.text3 : color.primary}
              />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.card,
    borderCurve: "continuous",
    overflow: "hidden",
    marginVertical: space.md,
    boxShadow: shadow.card,
  },
  headerRow: {
    flexDirection: "row",
    gap: space.sm,
    backgroundColor: color.bg,
    paddingVertical: 10,
    paddingHorizontal: space.md,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: color.text3,
  },
  dataRow: {
    flexDirection: "row",
    gap: space.sm,
    alignItems: "center",
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.border,
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: space.md,
  },
  firstDataRow: {
    borderTopWidth: 0,
  },
  cell: {
    fontSize: 14,
    color: color.text,
  },
  secondaryCell: {
    fontSize: 12,
    color: color.text3,
    fontVariant: ["tabular-nums"],
  },
  cellWrap: {
    alignItems: "flex-start",
  },
  numericWrap: {
    alignItems: "center",
  },
  numericCell: {
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  dashCell: {
    color: color.text3,
  },
  skeleton: {
    height: 16,
    backgroundColor: color.skeleton,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  emptyWrap: {
    alignItems: "center",
    gap: space.sm,
    padding: space.xxl,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: color.text,
  },
  emptyMessage: {
    fontSize: 14,
    color: color.text2,
    textAlign: "center",
  },
  emptyAction: {
    marginTop: space.sm,
    minHeight: tokens.hit,
    justifyContent: "center",
    backgroundColor: color.primary,
    borderRadius: radius.cta,
    borderCurve: "continuous",
    paddingVertical: 12,
    paddingHorizontal: space.xl,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  emptyActionText: {
    color: color.onPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: space.md,
    backgroundColor: color.bg,
    borderTopWidth: 1,
    borderTopColor: color.border,
    flexWrap: "wrap",
    gap: space.sm,
  },
  pageInfoWrap: {
    flexDirection: "column",
    gap: 2,
  },
  pageInfoText: {
    fontSize: 12,
    color: color.text2,
    fontWeight: "500",
  },
  pageInfoBold: {
    fontWeight: "700",
    color: color.text,
  },
  pageRangeText: {
    fontSize: 11,
    color: color.text3,
  },
  paginationButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.input,
    borderCurve: "continuous",
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  pageButtonDisabled: {
    opacity: 0.45,
    backgroundColor: color.bg,
  },
  pageButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: color.primary,
  },
  pageButtonTextDisabled: {
    color: color.text3,
  },
});

"use client";

import { useState } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RoadmapNode({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary" />

      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.02 }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="min-w-[250px] max-w-[400px]"
      >
        <Card
          className={`border-2 ${
            data.type === "phase"
              ? "border-primary"
              : data.type === "week"
              ? "border-primary/60"
              : "border-primary/30"
          } elegant-shadow`}
        >
          <CardHeader
            className={`p-3 ${
              data.type === "phase"
                ? "bg-primary/20"
                : data.type === "week"
                ? "bg-primary/10"
                : ""
            }`}
          >
            <CardTitle
              className={`text-sm ${data.type === "phase" ? "text-lg" : ""}`}
            >
              {data.title}
            </CardTitle>
            {data.subtitle && (
              <CardDescription className="text-xs">
                {data.subtitle}
              </CardDescription>
            )}
          </CardHeader>

          {isExpanded && data.content && (
            <CardContent className="p-3 text-xs max-h-[300px] overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: data.content }} />
            </CardContent>
          )}
        </Card>
      </motion.div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary"
      />
    </>
  );
}

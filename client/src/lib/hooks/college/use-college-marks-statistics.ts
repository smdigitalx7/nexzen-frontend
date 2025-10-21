import { useMemo } from 'react';

export interface CollegeMarksStatistics {
  totalMarks: number;
  avgPercentage: string;
  passPercentage: string;
  topScore: number;
}

export interface CollegeMarksData {
  percentage?: number | null;
  grade?: string | null;
}

export const useCollegeMarksStatistics = (marks: CollegeMarksData[]): CollegeMarksStatistics => {
  return useMemo(() => {
    const totalMarks = marks.length;
    const avgPercentage = marks.length > 0 ? 
      marks.reduce((sum, mark) => sum + (mark.percentage || 0), 0) / marks.length : 0;
    
    const passCount = marks.filter(mark => (mark.percentage || 0) >= 35).length;
    const passPercentage = totalMarks > 0 ? (passCount / totalMarks * 100).toFixed(1) : '0';
    
    const topPerformers = marks
      .slice()
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
      .slice(0, 1);

    return {
      totalMarks,
      avgPercentage: avgPercentage.toFixed(1),
      passPercentage,
      topScore: topPerformers[0]?.percentage || 0,
    };
  }, [marks]);
};

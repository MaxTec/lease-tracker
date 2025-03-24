"use client";

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LeaseData } from '@/utils/leaseUtils';
// import { numberToWords } from '@/utils/leaseUtils';

// Define styles for the lease PDF
const styles = StyleSheet.create({
  page: {
    padding: 72, // 1 inch margin
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  header: {
    fontSize: 10,
    marginBottom: 20,
  },
  clauseTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  clauseContent: {
    fontSize: 10,
    marginBottom: 15,
    marginLeft: 20,
  },
  signature: {
    fontSize: 10,
    marginTop: 30,
  },
});

interface LeasePDFProps {
  url: string;
}

export default function LeasePDF({ url }: LeasePDFProps) {
  return (
    <div className="w-full h-[800px]">
      <iframe
        src={url}
        className="w-full h-full"
        title="Lease Agreement Preview"
      />
    </div>
  );
} 
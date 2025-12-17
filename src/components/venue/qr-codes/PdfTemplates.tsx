import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { QrDesignState } from '@/lib/qr-materials';

// Register generic font with Cyrillic support
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto',
  },
  // Table Tent Styles
  tentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  tentFace: {
    height: '50%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  tentFaceInverted: {
    transform: 'rotate(180deg)',
  },
  
  // Sticker Styles
  stickerPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  
  // Common Elements
  ctaText: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 700,
    marginBottom: 20,
  },
  subText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,
  },
  qrContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  qrImage: {
    width: 150,
    height: 150,
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 10,
    objectFit: 'contain',
  },
  cutLine: {
    borderStyle: 'dashed',
    borderColor: '#999',
    borderWidth: 1,
    position: 'absolute',
    width: '100%',
  },
  foldLine: {
    borderStyle: 'dotted',
    borderColor: '#999',
    borderWidth: 1,
    position: 'absolute',
    width: '100%',
  }
});

interface PdfTemplateProps {
  design: QrDesignState;
  qrDataUrl: string;
  venueName?: string;
}

const TableTent = ({ design, qrDataUrl, venueName }: PdfTemplateProps) => {
  const bgStyle = { backgroundColor: design.baseColor };
  const textStyle = { color: design.accentColor };
  
  const Content = () => (
    <>
      {design.showLogo && design.logoUrl && (
        <Image src={design.logoUrl} style={styles.logo} />
      )}
      <Text style={[styles.ctaText, textStyle]}>{design.ctaText}</Text>
      <View style={styles.qrContainer}>
        <Image src={qrDataUrl} style={styles.qrImage} />
      </View>
      <Text style={[styles.subText, textStyle]}>{venueName || 'Tipsio'}</Text>
    </>
  );

  return (
    <Page size="A4" style={[styles.page, bgStyle]}>
      {/* Top Half (Back side, upside down) */}
      <View style={[styles.tentFace, styles.tentFaceInverted, { borderBottomWidth: 1, borderBottomColor: '#eee', borderBottomStyle: 'dashed' }]}>
        <Content />
      </View>
      
      {/* Bottom Half (Front side) */}
      <View style={styles.tentFace}>
        <Content />
      </View>
      
      {/* Fold Line Indicator */}
      <View style={{ position: 'absolute', top: '50%', width: '100%', borderTopWidth: 1, borderTopColor: '#ccc', borderTopStyle: 'dashed' }} />
    </Page>
  );
};

const Sticker = ({ design, qrDataUrl, venueName }: PdfTemplateProps) => {
  const bgStyle = { backgroundColor: design.baseColor };
  const textStyle = { color: design.accentColor };

  return (
    <Page size="A4" style={styles.stickerPage}>
      <View style={[styles.stickerCircle, bgStyle]}>
         {design.showLogo && design.logoUrl && (
          <Image src={design.logoUrl} style={styles.logo} />
        )}
        <Text style={[styles.ctaText, textStyle, { fontSize: 18 }]}>{design.ctaText}</Text>
        <View style={[styles.qrContainer, { borderRadius: 5, padding: 5 }]}>
          <Image src={qrDataUrl} style={[styles.qrImage, { width: 100, height: 100 }]} />
        </View>
        <Text style={[styles.subText, textStyle]}>{venueName || 'Tipsio'}</Text>
      </View>
      <Text style={{ position: 'absolute', bottom: 50, fontSize: 10, color: '#999' }}>
        Print on A4 sticker paper
      </Text>
    </Page>
  );
};

const Card = ({ design, qrDataUrl, venueName }: PdfTemplateProps) => {
  const bgStyle = { backgroundColor: design.baseColor };
  const textStyle = { color: design.accentColor };

  // Business card size: 85mm x 55mm (standard)
  return (
    <Page size={[241, 153]} style={[styles.page, bgStyle]}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 15 }}>
        {design.showLogo && design.logoUrl && (
          <Image src={design.logoUrl} style={[styles.logo, { width: 25, height: 25, marginBottom: 5 }]} />
        )}
        <Text style={[styles.ctaText, textStyle, { fontSize: 12, marginBottom: 8 }]}>{design.ctaText}</Text>
        <View style={[styles.qrContainer, { padding: 5, borderRadius: 5 }]}>
          <Image src={qrDataUrl} style={[styles.qrImage, { width: 70, height: 70 }]} />
        </View>
        <Text style={[styles.subText, textStyle, { fontSize: 8, marginTop: 5 }]}>{venueName || 'Tipsio'}</Text>
      </View>
    </Page>
  );
};

const Poster = ({ design, qrDataUrl, venueName }: PdfTemplateProps) => {
  const bgStyle = { backgroundColor: design.baseColor };
  const textStyle = { color: design.accentColor };

  return (
    <Page size="A4" style={[styles.page, bgStyle]}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        {design.showLogo && design.logoUrl && (
          <Image src={design.logoUrl} style={[styles.logo, { width: 60, height: 60, marginBottom: 20 }]} />
        )}
        <Text style={[styles.ctaText, textStyle, { fontSize: 36, marginBottom: 30 }]}>{design.ctaText}</Text>
        <View style={[styles.qrContainer, { padding: 15, borderRadius: 15 }]}>
          <Image src={qrDataUrl} style={[styles.qrImage, { width: 200, height: 200 }]} />
        </View>
        <Text style={[styles.subText, textStyle, { fontSize: 16, marginTop: 20 }]}>{venueName || 'Tipsio'}</Text>
      </View>
    </Page>
  );
};

export const QrPdfDocument = (props: PdfTemplateProps) => {
  return (
    <Document>
      {props.design.materialType === 'table-tent' && <TableTent {...props} />}
      {props.design.materialType === 'sticker' && <Sticker {...props} />}
      {props.design.materialType === 'card' && <Card {...props} />}
      {props.design.materialType === 'poster' && <Poster {...props} />}
    </Document>
  );
};

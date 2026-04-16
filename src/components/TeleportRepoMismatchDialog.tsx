import { c as _c } from "react/compiler-runtime";
import React, { useCallback, useState } from 'react';
import { useI18n } from '../hooks/useI18n.js';
import { Box, Text } from '../ink.js';
import { getDisplayPath } from '../utils/file.js';
import { removePathFromRepo, validateRepoAtPath } from '../utils/githubRepoPathMapping.js';
import { Select } from './CustomSelect/index.js';
import { Dialog } from './design-system/Dialog.js';
import { Spinner } from './Spinner.js';
type Props = {
  targetRepo: string;
  initialPaths: string[];
  onSelectPath: (path: string) => void;
  onCancel: () => void;
};
export function TeleportRepoMismatchDialog(t0) {
  const $ = _c(25);
  const {
    targetRepo,
    initialPaths,
    onSelectPath,
    onCancel
  } = t0;
  const { t, locale } = useI18n();
  const [availablePaths, setAvailablePaths] = useState(initialPaths);
  const [errorMessage, setErrorMessage] = useState(null);
  const [validating, setValidating] = useState(false);
  let t1;
  if ($[0] !== availablePaths || $[1] !== locale || $[2] !== onCancel || $[3] !== onSelectPath || $[4] !== targetRepo) {
    t1 = async value => {
      if (value === "cancel") {
        onCancel();
        return;
      }
      setValidating(true);
      setErrorMessage(null);
      const isValid = await validateRepoAtPath(value, targetRepo);
      if (isValid) {
        onSelectPath(value);
        return;
      }
      removePathFromRepo(targetRepo, value);
      const updatedPaths = availablePaths.filter(p => p !== value);
      setAvailablePaths(updatedPaths);
      setValidating(false);
      setErrorMessage(t('teleport.repoMismatch.pathInvalid', { path: getDisplayPath(value) }));
    };
    $[0] = availablePaths;
    $[1] = locale;
    $[2] = onCancel;
    $[3] = onSelectPath;
    $[4] = targetRepo;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  const handleChange = t1;
  let t2;
  if ($[6] !== availablePaths || $[7] !== locale) {
    let t3;
    if ($[9] !== locale) {
      t3 = {
        label: t('common.cancel'),
        value: "cancel"
      };
      $[9] = locale;
      $[10] = t3;
    } else {
      t3 = $[10];
    }
    let t4;
    if ($[23] !== locale) {
      t4 = p => ({
        label: t('teleport.repoMismatch.usePath', { path: getDisplayPath(p) }),
        value: p
      });
      $[23] = locale;
      $[24] = t4;
    } else {
      t4 = $[24];
    }
    const _temp = t4;
    t2 = [...availablePaths.map(_temp), t3];
    $[6] = availablePaths;
    $[7] = locale;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  const options = t2;
  let t3;
  if ($[11] !== availablePaths.length || $[12] !== errorMessage || $[13] !== handleChange || $[14] !== locale || $[15] !== options || $[16] !== targetRepo || $[17] !== validating) {
    t3 = availablePaths.length > 0 ? <><Box flexDirection="column" gap={1}>{errorMessage && <Text color="error">{errorMessage}</Text>}<Text>{t('teleport.repoMismatch.openIn', { repo: targetRepo })}</Text></Box>{validating ? <Box><Spinner /><Text> {t('teleport.repoMismatch.validating')}</Text></Box> : <Select options={options} onChange={value_0 => void handleChange(value_0)} />}</> : <Box flexDirection="column" gap={1}>{errorMessage && <Text color="error">{errorMessage}</Text>}<Text dimColor={true}>{t('teleport.repoMismatch.runFromCheckout', { repo: targetRepo })}</Text></Box>;
    $[11] = availablePaths.length;
    $[12] = errorMessage;
    $[13] = handleChange;
    $[14] = locale;
    $[15] = options;
    $[16] = targetRepo;
    $[17] = validating;
    $[18] = t3;
  } else {
    t3 = $[18];
  }
  let t4;
  if ($[19] !== locale || $[20] !== onCancel || $[21] !== t3) {
    t4 = <Dialog title={t('teleport.repoMismatch.title')} onCancel={onCancel} color="background">{t3}</Dialog>;
    $[19] = locale;
    $[20] = onCancel;
    $[21] = t3;
    $[22] = t4;
  } else {
    t4 = $[22];
  }
  return t4;
}


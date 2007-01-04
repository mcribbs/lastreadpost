--  LastReadPostServer
-- version 0.2
-- 2006-04-04
-- Copyright (c) 2006, Matt Cribbs
-- Released under the GPL license
-- http://www.gnu.org/copyleft/gpl.html
-- 

-- --------------------------------------------------------

-- 
-- Table structure for table `history`
-- 
CREATE TABLE `history` (
  `history` text NOT NULL default ''
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Data for table `history`
-- 
INSERT INTO `history` VALUES ('');

-- --------------------------------------------------------
-- 
-- Table structure for table `postvalues`
--
CREATE TABLE `postvalues` (
  `key` varchar(255) character set utf8 collate utf8_bin NOT NULL default '',
  `r` varchar(255) character set utf8 collate utf8_bin NOT NULL default '',
  `p` varchar(255) character set utf8 collate utf8_bin NOT NULL default '',
  `c` varchar(255) character set utf8 collate utf8_bin NOT NULL default '',
  `t` varchar(255) character set utf8 collate utf8_bin NOT NULL default '',
  PRIMARY KEY  (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
